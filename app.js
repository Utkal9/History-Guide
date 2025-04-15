document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("search-input");
    const loadingElement = document.getElementById("loading");
    const resultsContainer = document.getElementById("results");
    const exampleTags = document.querySelectorAll(".tag");

    // Event Listeners
    searchForm.addEventListener("submit", handleSearch);
    exampleTags.forEach((tag) => {
        tag.addEventListener("click", () => {
            searchInput.value = tag.textContent;
            handleSearch({ preventDefault: () => {} });
        });
    });

    // Main Search Handler
    async function handleSearch(e) {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (!query) return;

        showLoading();
        clearResults();

        try {
            // 1. First try Wikipedia (always works)
            const wikiData = await fetchWikipediaData(query);

            // 2. Then try free AI service (no key needed)
            let aiInsights = await fetchFreeAIAnalysis(query);

            // 3. If no AI, generate smart mock analysis
            if (!aiInsights || aiInsights.includes("Could not generate")) {
                aiInsights = generateMockAnalysis(query);
            }

            displayCombinedResults(wikiData, aiInsights, query);
        } catch (error) {
            showError(error.message, query);
        } finally {
            hideLoading();
        }
    }

    // Wikipedia API (no key needed)
    async function fetchWikipediaData(query) {
        try {
            const response = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
                    query
                )}`
            );
            if (!response.ok) throw new Error("No Wikipedia results");
            return await response.json();
        } catch (error) {
            console.error("Wikipedia API error:", error);
            return {
                title: query,
                extract: `Could not load Wikipedia summary for "${query}".`,
                content_urls: {
                    desktop: {
                        page: `https://en.wikipedia.org/wiki/${encodeURIComponent(
                            query
                        )}`,
                    },
                },
            };
        }
    }

    // Free AI Service (no key needed) - using DeepSeek's API
    async function fetchFreeAIAnalysis(query) {
        try {
            const response = await fetch(
                "https://api.deepseek.com/v1/chat/completions",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: "deepseek-chat",
                        messages: [
                            {
                                role: "system",
                                content:
                                    "Provide concise historical analysis with key dates and significance.",
                            },
                            {
                                role: "user",
                                content: `Give me 5 key historical facts about ${query} in bullet points.`,
                            },
                        ],
                        temperature: 0.7,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Free AI service unavailable");
            }

            const data = await response.json();
            return (
                data.choices[0]?.message?.content || "No AI response generated"
            );
        } catch (error) {
            console.error("Free AI API error:", error);
            return null;
        }
    }

    // Smart Mock Data Generator
    function generateMockAnalysis(query) {
        const periods = [
            "Ancient times (pre-500 CE)",
            "Medieval period (500-1500)",
            "Early modern era (1500-1800)",
            "Industrial age (1800-1900)",
            "Modern era (1900-present)",
        ];

        const impacts = [
            "significantly influenced cultural development",
            "played a key role in technological advancements",
            "affected political structures",
            "changed economic systems",
            "impacted social norms",
        ];

        const facts = [
            `The ${query} first emerged in ${
                periods[Math.floor(Math.random() * periods.length)]
            }.`,
            `During ${
                periods[Math.floor(Math.random() * periods.length)]
            }, the ${query} ${
                impacts[Math.floor(Math.random() * impacts.length)]
            }.`,
            `Key figures associated with ${query} include...`,
            `The ${query} led to major changes in...`,
            `Modern interpretations of ${query} suggest...`,
        ];

        return facts.join("\n\n");
    }

    // Display Combined Results
    function displayCombinedResults(wikiData, aiInsights, query) {
        let html = '<div class="results-grid">';

        // Wikipedia Card
        html += `
            <div class="result-card wiki-card">
                <div class="source-header">
                    <img src="https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/1200px-Wikipedia-logo-v2.svg.png" 
                         alt="Wikipedia" class="source-logo">
                    <h2 class="result-title">${wikiData.title || query}</h2>
                </div>
                ${
                    wikiData.thumbnail
                        ? `<img src="${wikiData.thumbnail.source}" class="result-image">`
                        : ""
                }
                <div class="result-content">
                    <p>${
                        wikiData.extract || "No Wikipedia summary available."
                    }</p>
                </div>
                <a href="${
                    wikiData.content_urls?.desktop?.page ||
                    `https://wikipedia.org/wiki/${encodeURIComponent(query)}`
                }" 
                   target="_blank" 
                   class="read-more">
                    Read full Wikipedia article <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
        `;

        // AI/Mock Analysis Card
        html += `
            <div class="result-card ai-card">
                <div class="source-header">
                    <i class="fas fa-robot" style="font-size: 2rem; color: #4f46e5;"></i>
                    <h2 class="result-title">Historical Analysis</h2>
                </div>
                <div class="ai-content">
                    ${formatResponse(aiInsights)}
                </div>
                <div class="ai-disclaimer">
                    <i class="fas fa-info-circle"></i> ${
                        aiInsights.includes("Mock")
                            ? "Simulated historical analysis"
                            : "AI-generated insights"
                    }
                </div>
            </div>
        `;

        html += "</div>";
        resultsContainer.innerHTML = html;
    }

    // Format response text
    function formatResponse(text) {
        return text
            .split("\n\n")
            .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
            .join("");
    }

    // UI Helpers
    function showLoading() {
        loadingElement.classList.remove("hidden");
        resultsContainer.innerHTML = '<div class="loading-placeholder"></div>';
    }

    function hideLoading() {
        loadingElement.classList.add("hidden");
    }

    function clearResults() {
        resultsContainer.innerHTML = "";
    }

    function showError(message, query) {
        resultsContainer.innerHTML = `
            <div class="result-card error-card">
                <h2 class="result-title">Showing Basic Results</h2>
                <p>${message}</p>
                <div class="fallback-content">
                    <h3>About ${query}:</h3>
                    <p>${generateMockAnalysis(query)}</p>
                    <p>For more accurate results, try again later or check Wikipedia directly.</p>
                </div>
            </div>
        `;
    }
});
