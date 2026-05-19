use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::ipc::Channel;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatRequest {
    pub messages: Vec<ChatMessage>,
    pub model: Option<String>,
    pub api_key: String,
    pub base_url: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct ChatStreamEvent {
    pub event: String,
    pub data: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize)]
struct OpenAIModel {
    id: String,
}

#[derive(Debug, Deserialize)]
struct OpenAIModelList {
    data: Vec<OpenAIModel>,
}

#[derive(Debug, Deserialize)]
struct OpenAIChoice {
    delta: Option<OpenAIDelta>,
}

#[derive(Debug, Deserialize)]
struct OpenAIDelta {
    content: Option<String>,
}

#[derive(Debug, Deserialize)]
struct OpenAIStreamChunk {
    model: Option<String>,
    choices: Option<Vec<OpenAIChoice>>,
}

async fn resolve_model(
    client: &reqwest::Client,
    base_url: &str,
    api_key: &str,
    requested_model: Option<String>,
) -> Result<String, String> {
    // If a specific model was chosen, use it
    if let Some(model) = requested_model {
        if !model.is_empty() && model != "auto" {
            return Ok(model);
        }
    }

    // Auto: pick the first available model from the API
    let mut headers = HeaderMap::new();
    headers.insert(
        AUTHORIZATION,
        HeaderValue::from_str(&format!("Bearer {}", api_key))
            .map_err(|e| format!("Invalid API key: {}", e))?,
    );

    let res = client
        .get(format!("{}/models", base_url))
        .headers(headers.clone())
        .send()
        .await
        .map_err(|e| format!("Failed to fetch models: {}", e))?;

    if res.status().is_success() {
        let model_list: OpenAIModelList = res
            .json()
            .await
            .map_err(|e| format!("Failed to parse model list: {}", e))?;

        if let Some(first) = model_list.data.first() {
            return Ok(first.id.clone());
        }
    }

    // Fall back to hardcoded default
    Ok("kimi-k2.6".to_string())
}

#[tauri::command]
pub async fn chat(
    messages: Vec<ChatMessage>,
    model: Option<String>,
    api_key: String,
    base_url: String,
    on_event: Channel<ChatStreamEvent>,
) -> Result<(), String> {
    let client = Arc::new(
        reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(120))
            .build()
            .map_err(|e| format!("Failed to create HTTP client: {}", e))?,
    );

    // Resolve model
    let resolved_model = resolve_model(&client, &base_url, &api_key, model).await?;

    // Send the resolved model name as the first event
    on_event
        .send(ChatStreamEvent {
            event: "model".to_string(),
            data: Some(serde_json::json!({ "model": resolved_model })),
        })
        .map_err(|e| format!("Failed to send model event: {}", e))?;

    // Prepare headers
    let mut headers = HeaderMap::new();
    headers.insert(
        AUTHORIZATION,
        HeaderValue::from_str(&format!("Bearer {}", api_key))
            .map_err(|e| format!("Invalid API key: {}", e))?,
    );
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    // Build request body
    let request_body = serde_json::json!({
        "model": resolved_model,
        "messages": messages,
        "stream": true,
    });

    // Send streaming request
    let res = client
        .post(format!("{}/chat/completions", base_url))
        .headers(headers)
        .json(&request_body)
        .send()
        .await
        .map_err(|e| format!("Failed to send chat request: {}", e))?;

    if !res.status().is_success() {
        let error_text = res
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("API error: {}", error_text));
    }

    // Stream the response
    let mut stream = res.bytes_stream();
    let mut buffer = String::new();

    use futures_util::StreamExt;

    while let Some(chunk_result) = stream.next().await {
        let chunk = chunk_result.map_err(|e| format!("Stream error: {}", e))?;

        buffer.push_str(&String::from_utf8_lossy(&chunk));

        // Process complete lines using a cursor approach
        loop {
            if let Some(pos) = buffer.find('\n') {
                // Extract the complete line (excluding the newline)
                let line = buffer[..pos].trim().to_string();
                // Keep the rest (after the newline)
                buffer = buffer[pos + 1..].to_string();
                
                if line.is_empty() {
                    continue;
                }

                if line.starts_with("data: ") {
                    let data = &line[6..];

                    if data == "[DONE]" {
                        break;
                    }

                    match serde_json::from_str::<OpenAIStreamChunk>(data) {
                        Ok(parsed) => {
                            if let Some(choices) = &parsed.choices {
                                if let Some(choice) = choices.first() {
                                    if let Some(delta) = &choice.delta {
                                        if let Some(content) = &delta.content {
                                            if !content.is_empty() {
                                                on_event
                                                    .send(ChatStreamEvent {
                                                        event: "delta".to_string(),
                                                        data: Some(serde_json::json!({
                                                            "delta": content
                                                        })),
                                                    })
                                                    .map_err(|e| {
                                                        format!("Failed to send delta event: {}", e)
                                                    })?;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        Err(e) => {
                            eprintln!("Failed to parse chunk: {} - {}", e, data);
                        }
                    }
                }
            } else {
                // No complete line yet, wait for more data
                break;
            }
        }
    }

    Ok(())
}
