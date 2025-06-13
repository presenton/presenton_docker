import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import fs from 'fs';
import path from 'path';
import os from 'os';

interface Position {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface FontStyles {
  name: string;
  size: number;
  bold: boolean;
  weight: number;
  color: string;
}

interface TextElement {
  position: Position;
  paragraphs: {
    alignment: number;
    text: string;
    font: FontStyles;
  }[];
}

interface PictureElement {
  position: Position;
  picture: {
    is_network: boolean;
    path: string;
  };
  shape: string | null;
  object_fit: {
    fit: string | null;
    focus: number[];
  };
  overlay: string | null;
  border_radius: number[];
}

interface BoxElement {
  position: Position;
  type: number;
  fill: {
    color: string;
  };
  border_radius: number;
  stroke: {
    color: string;
    thickness: number;
  };
  shadow: {
    radius: number;
    color: string;
    offset: number;
    opacity: number;
    angle: number;
  };
}

interface LineElement {
  position: Position;
  lineType: number;
  thickness: string;
  color: string;
}

interface GraphElement {
  position: Position;
  picture: {
    is_network: boolean;
    path: string;
  };
  border_radius: number[];
}

type SlideElement = TextElement | PictureElement | BoxElement | LineElement | GraphElement;

interface SlideMetadata {
  slideIndex: number;
  backgroundColor: string;
  elements: SlideElement[];
}

interface ThemeParams {
  theme: string;
  customColors?: {
    slideBg: string;
    slideTitle: string;
    slideHeading: string;
    slideDescription: string;
    slideBox: string;
  };
}

export async function POST(request: NextRequest) {
  let browser;
  try {
    const body = await request.json();
    const { url, theme, customColors } = body;

    if (!url) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

    try {
      await page.goto(url, {
        waitUntil: "networkidle0",
        timeout: 60000,
      });
    } catch (error) {
      await browser.close();
      return NextResponse.json({ error: "Failed to Navigate to provided URL" }, { status: 500 });
    }

    try {
      await page.waitForSelector('[data-element-type="slide-container"]', {
        timeout: 60000,
      });

      await page.evaluate(
        async (params: ThemeParams) => {
          const { theme, customColors } = params;
          const containers = document.querySelectorAll(".slide-theme");

          containers.forEach((container) => {
            container.removeAttribute("data-theme");
            container.setAttribute("data-theme", theme);
          });

          if (theme === "custom" && customColors) {
            const root = document.documentElement;
            root.style.setProperty("--custom-slide-bg", customColors.slideBg);
            root.style.setProperty("--custom-slide-title", customColors.slideTitle);
            root.style.setProperty("--custom-slide-heading", customColors.slideHeading);
            root.style.setProperty("--custom-slide-description", customColors.slideDescription);
            root.style.setProperty("--custom-slide-box", customColors.slideBox);
          }
        },
        { theme, customColors }
      );
    } catch (error) {
      await browser.close();
      return NextResponse.json({ error: "Slide container not found" }, { status: 500 });
    }

    const metadata = await page.evaluate(async () => {
      function rgbToHex(color: string) {
        if (!color || color === "transparent" || color === "none") return "000000";
        if (color.startsWith("#")) return color.replace("#", "");
        const matches = color.match(/\d+/g);
        if (!matches) return "000000";
        const r = parseInt(matches[0]);
        const g = parseInt(matches[1]);
        const b = parseInt(matches[2]);
        return [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
      }

      async function collectSlideMetadata(): Promise<SlideMetadata[]> {
        const slidesMetadata: SlideMetadata[] = [];
        const slideContainers = Array.from(
          document.querySelectorAll('[data-element-type="slide-container"]')
        );

        for (const container of slideContainers) {
          const containerEl = container as HTMLElement;
          containerEl.style.width = "1280px";
          containerEl.style.height = "720px";
          containerEl.style.transform = "none";

          const containerRect = containerEl.getBoundingClientRect();
          const slideIndex = parseInt(
            containerEl.getAttribute("data-slide-index") || "0"
          );
          const containerComputedStyle = window.getComputedStyle(containerEl);

          const slideMetadata: SlideMetadata = {
            slideIndex,
            backgroundColor: rgbToHex(containerComputedStyle.backgroundColor),
            elements: [],
          };
          const slideType = containerEl.getAttribute("data-slide-type");

          const elements = Array.from(
            containerEl.querySelectorAll(
              '[data-slide-element]:not([data-element-type="slide-container"])'
            )
          );

          for (const element of elements) {
            const el = element as HTMLElement;
            const isIcon = el.getAttribute("data-is-icon");
            const isAlign = el.getAttribute("data-is-align");

            const elementRect = el.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(el);

            const position: Position = {
              left: Math.round(elementRect.left - containerRect.left),
              top: Math.round(elementRect.top - containerRect.top),
              width: Math.round(elementRect.width),
              height: Math.round(elementRect.height),
            };

            const elementType = el.getAttribute("data-element-type");
            if (!elementType) continue;

            const fontStyles: FontStyles = {
              name: computedStyle.fontFamily.split('_')[2] || 'Inter',
              size: parseInt(computedStyle.fontSize),
              bold: parseInt(computedStyle.fontWeight) >= 500 ? true : false,
              weight: parseInt(computedStyle.fontWeight),
              color: rgbToHex(computedStyle.color),
            };

            switch (elementType) {
              case "text":
                const textContent = el.getAttribute("data-text-content");
                const textElement: TextElement = {
                  position,
                  paragraphs: [
                    {
                      alignment: isAlign === 'true' ? 2 : 1,
                      text: textContent || el.textContent || "",
                      font: fontStyles,
                    },
                  ],
                };
                slideMetadata.elements.push(textElement);
                break;

              case "picture":
                const imgEl = el.tagName.toLowerCase() === "img" ? el as HTMLImageElement : el.querySelector("img") as HTMLImageElement;
                if (imgEl) {
                  const focialPointx = parseFloat(imgEl.getAttribute('data-focial-point-x') || '0');
                  const focialPointy = parseFloat(imgEl.getAttribute('data-focial-point-y') || '0');
                  const image_type = imgEl.getAttribute('data-image-type');
                  const objectFit = imgEl.getAttribute('data-object-fit');

                  const pictureElement: PictureElement = {
                    position,
                    picture: {
                      is_network: imgEl.src.startsWith("http"),
                      path: imgEl.src || imgEl.getAttribute("data-image-path") || "",
                    },
                    shape: image_type,
                    object_fit: {
                      fit: objectFit,
                      focus: [focialPointx, focialPointy],
                    },
                    overlay: isIcon ? "ffffff" : null,
                    border_radius: slideType === "4"
                      ? [parseInt(computedStyle.borderRadius), parseInt(computedStyle.borderRadius), 0, 0]
                      : [parseInt(computedStyle.borderRadius), parseInt(computedStyle.borderRadius), parseInt(computedStyle.borderRadius), parseInt(computedStyle.borderRadius)],
                  };
                  slideMetadata.elements.push(pictureElement);
                }
                break;

              case "slide-box":
              case "filledbox":
                const boxShadow = computedStyle.boxShadow;
                let shadowRadius = 0;
                let shadowColor = "000000";
                let shadowOffsetX = 0;
                let shadowOffsetY = 0;
                let shadowOpacity = 0;

                if (boxShadow && boxShadow !== "none") {
                  const boxShadowRegex = /rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)?\s+(-?\d+)px\s+(-?\d+)px\s+(-?\d+)px/;
                  const match = boxShadow.match(boxShadowRegex);

                  if (match) {
                    const r = match[1];
                    const g = match[2];
                    const b = match[3];
                    const rgbStr = `rgb(${r}, ${g}, ${b})`;
                    shadowColor = rgbToHex(rgbStr);
                    shadowOpacity = match[4] ? parseFloat(match[4]) : 1;
                    shadowOffsetX = parseInt(match[5]);
                    shadowOffsetY = parseInt(match[6]);
                    shadowRadius = parseInt(match[7]);
                  }
                }

                const boxElement: BoxElement = {
                  position,
                  type: computedStyle.borderRadius === "9999px" || computedStyle.borderRadius === "50%" ? 9 : 5,
                  fill: {
                    color: rgbToHex(computedStyle.backgroundColor),
                  },
                  border_radius: parseInt(computedStyle.borderRadius) || 0,
                  stroke: {
                    color: rgbToHex(computedStyle.borderColor),
                    thickness: parseInt(computedStyle.borderWidth) || 0,
                  },
                  shadow: {
                    radius: shadowRadius,
                    color: shadowColor,
                    offset: Math.sqrt(shadowOffsetX * shadowOffsetX + shadowOffsetY * shadowOffsetY),
                    opacity: shadowOpacity,
                    angle: Math.round((Math.atan2(shadowOffsetY, shadowOffsetX) * 180) / Math.PI),
                  },
                };
                slideMetadata.elements.push(boxElement);
                break;

              case "line":
                const lineElement: LineElement = {
                  position,
                  lineType: 1,
                  thickness: computedStyle.borderWidth || computedStyle.height,
                  color: rgbToHex(computedStyle.borderColor || computedStyle.backgroundColor),
                };
                slideMetadata.elements.push(lineElement);
                break;

              case "graph":
                const graphId = el.getAttribute("data-element-id");
                const graphElement: GraphElement = {
                  position,
                  picture: {
                    is_network: true,
                    path: `__GRAPH_PLACEHOLDER__${graphId}`,
                  },
                  border_radius: [0, 0, 0, 0],
                };
                slideMetadata.elements.push(graphElement);
                break;
            }
          }

          slidesMetadata.push(slideMetadata);
        }

        return slidesMetadata;
      }

      return await collectSlideMetadata();
    });

    const graphElements = await page.$$('[data-element-type="graph"]');

    for (const graphElement of graphElements) {
      const graphId = await graphElement.evaluate((el: Element) =>
        el.getAttribute("data-element-id")
      );

      const screenshot = await graphElement.screenshot({
        type: "jpeg",
        encoding: "base64",
        quality: 100,
        omitBackground: true,
      });

      try {
        const tempDir = process.env.TEMP_DIRECTORY || os.tmpdir();

        // Generate a unique filename
        const filename = `chart-${graphId}-${Date.now()}.jpg`;
        const filePath = path.join(tempDir, filename);

        // Save the file
        fs.writeFileSync(filePath, Buffer.from(screenshot, 'base64'));

        metadata.forEach((slide) => {
          slide.elements.forEach((element) => {
            if ('picture' in element && element.picture.path === `__GRAPH_PLACEHOLDER__${graphId}`) {
              element.picture.path = filePath;
            }
          });
        });
      } catch (error) {
        console.error('Error saving screenshot:', error);
        continue;
      }
    }
    await browser.close();


    const slides = metadata.map((slide: any, index: any) => {
      return {
        shapes: slide.elements,
      };
    });

    const apiBody = {
      pptx_model: {
        background_color: metadata[0].backgroundColor,
        slides: slides,
      },
    };

    return NextResponse.json(apiBody);
  } catch (error) {
    console.error("Error during page preparation:", error);
    if (browser) await browser.close();
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    if (browser) await browser.close();
  }
} 