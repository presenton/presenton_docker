<p align="center">
  <img src="readme_assets/images/presenton-logo.png" height="90" alt="Presenton Logo" />
</p>

# Open-Source, Locally-Run AI Presentation Generator (Gamma Alternative)


**Presenton** is an open-source application for generating presentations with AI — all running locally on your device. Stay in control of your data and privacy while using models like OpenAI, Gemini, and others. Just plug in your own API keys and only pay for what you use.

![Demo](readme_assets/demo.gif)


## ✨ More Freedom with AI Presentations

* ✅ **Bring Your Own Key** — Only pay for what you use. OpenAI, Gemini (More coming soon...)
* ✅ **Runs Locally** — All code runs on your device
* ✅ **Privacy-First** — No tracking, no data stored by us
* ✅ **Flexible** — Generate presentations from prompts or outlines
* ✅ **Export Ready** — Save as PowerPoint (PPTX) and PDF
* ✅ **Fully Open-Source** — Apache 2.0 licensed

## Running Presenton Docker

#### 1. Start Presenton

##### Linux/MacOS (Bash/Zsh Shell):
```bash
docker run -it --name presenton -p 5000:80 -v "./user_data:/app/user_data" ghcr.io/presenton/presenton:latest
```

##### Windows (PowerShell):
```bash
docker run -it --name presenton -p 5000:80 -v "${PWD}\user_data:/app/user_data" ghcr.io/presenton/presenton:latest
```

#### 2. Open Presenton
Open http://localhost:5000 on browser of your choice to use Presenton.

> **Note: You can replace 5000 with any other port number of your choice to run Presenton on a different port number.**

## Deployment Configurations

You may want to directly provide your API KEYS as environment variables and keep them hidden. You can set these environment variables to achieve it.

- **CAN_CHANGE_KEYS=[true/false]**: Set this to **false** if you want to keep API Keys hidden and make them unmodifiable.
- **LLM=[openai/google]**: Select **LLM** of your choice.
- **OPENAI_API_KEY=[Your OpenAI API key]**: Provide this if **LLM** is set to **openai**
- **GOOGLE_API_KEY=[Your Google API Key]**: Provide this if **LLM** is set to **google**

```bash
docker run -it --name presenton -p 5000:80 -e LLM="openai" -e OPENAI_API_KEY="******" -e CAN_CHANGE_KEYS="false" -v "./user_data:/app/user_data" ghcr.io/presenton/presenton:latest
```

## Using Presenton API

### Generate Presentation

Endpoint: `/api/v1/ppt/generate/presentation`

Method: `POST`

Content-Type: `multipart/form-data`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| prompt | string | Yes | The main topic or prompt for generating the presentation |
| n_slides | integer | No | Number of slides to generate (default: 8, min: 5, max: 15) |
| language | string | No | Language for the presentation (default: "English") |
| theme | string | No | Presentation theme (default: "light"). Available options: "light", "dark", "cream", "royal_blue", "faint_yellow", "light_red", "dark_pink" |
| documents | File[] | No | Optional list of document files to include in the presentation. Supported file types: PDF, TXT, PPTX, DOCX |
| export_as | string | No | Export format ("pptx" or "pdf", default: "pptx") |

#### Response

```json
{
    "presentation_id": "string",
    "path": "string",
    "edit_path": "string"
}
```

#### Example Request

```bash
curl -X POST http://localhost:5000/api/v1/ppt/generate/presentation \
  -F "prompt=Introduction to Machine Learning" \
  -F "n_slides=5" \
  -F "language=English" \
  -F "theme=light" \
  -F "export_as=pptx"
```

#### Example Response

```json
{
  "presentation_id": "d3000f96-096c-4768-b67b-e99aed029b57",
  "path": "/static/user_data/d3000f96-096c-4768-b67b-e99aed029b57/Introduction_to_Machine_Learning.pptx",
  "edit_path": "/presentation?id=d3000f96-096c-4768-b67b-e99aed029b57"
}
```

## Features

### 1. Add prompt, select number of slides and language
![Demo](readme_assets/images/prompting.png)

### 2. Select theme
![Demo](readme_assets/images/select-theme.png)

### 3. Review and edit outline
![Demo](readme_assets/images/outline.png)

### 4. Select theme
![Demo](readme_assets/images/select-theme.png)

### 5. Present on app
![Demo](readme_assets/images/present.png)

### 6. Change theme
![Demo](readme_assets/images/change-theme.png)

### 7. Export presentation as PDF and PPTX
![Demo](readme_assets/images/export-presentation.png)

## Community
[Discord](https://discord.gg/VR89exqQ)

## License

Apache 2.0

