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

You may want to directly provide you API KEYS as environment variables and keep them hidden for deployment. You can set these environment variables to achieve it.

- **CAN_CHANGE_KEYS=[true/false]**: Set this to **false** if you want to keep API Keys hidden and make them unmodifiable.
- **LLM=[openai/google]**: Select **LLM** of your choice.
- **OPENAI_API_KEY=[Your OpenAI API key]**: Provide this if **LLM** is set to **openai**
- **GOOGLE_API_KEY=[Your Google API Key]**: Provide this if **LLM** is set to **google**

```bash
docker run -it --name presenton -p 5000:80 -e LLM="openai" -e OPENAI_API_KEY="******" -e CAN_CHANGE_KEYS="false" -v "./user_data:/app/user_data" ghcr.io/presenton/presenton:latest
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

