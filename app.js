// Felt SDK App - Generated
import { Felt } from "https://esm.run/@feltmaps/js-sdk";

let felt;
let allFeatures = [];
let filteredFeatures = [];
let minValue = 78795;
let layerId = null;

async function initializeMap() {
    try {
        console.log('Initializing Felt map...');

        // Embed the Felt map
        felt = await Felt.embed(
            document.getElementById('map'),
            '45JaGB9CDS9CW7mvDXifOC8A',
            {
                uiControls: {
                    showZoomControls: true,
                    showLegend: false,
                    showSearch: true,
                    showShare: true
                }
            }
        );

        console.log('Map loaded successfully');

        // Get the layer ID
        const layers = await felt.getLayers();
        if (layers && layers.length > 0) {
            layerId = layers[0].id;
            console.log('✓ Using layer:', layerId, layers[0].name);
        }

        // Setup event listeners
        setupFilters();
        setupMapInteractions();

        // Load and analyze data
        await loadData();

    } catch (error) {
        console.error('Failed to initialize map:', error);
    }
}

async function loadData() {
    try {
        const response = await fetch('data.geojson');
        const data = await response.json();
        allFeatures = data.features;
        console.log(`✓ Loaded ${allFeatures.length} features`);
        updateStats(allFeatures);
        await applyFilters();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function setupFilters() {
    const slider = document.getElementById('filter-slider');
    const valueDisplay = document.getElementById('filter-value');

    slider.addEventListener('input', async (e) => {
        minValue = parseFloat(e.target.value);
        valueDisplay.textContent = minValue.toFixed(1);
        await applyFilters();
    });
}

async function applyFilters() {
    // Filter local data for stats
    filteredFeatures = allFeatures.filter(feature => {
        const val = feature.properties['id'];
        return val >= minValue;
    });

    updateStats(filteredFeatures);
    console.log(`Filtered: ${filteredFeatures.length} / ${allFeatures.length} features`);

    // Filter the Felt map layer using SDK
    if (layerId && felt) {
        try {
            await felt.setLayerFilters({
                layerId: layerId,
                filters: ["id", "ge", minValue]
            });
            console.log(`✓ Applied filter to map: id >= ${minValue}`);
        } catch (error) {
            console.error('Failed to apply filter to map:', error);
        }
    }
}

function updateStats(features) {
    document.getElementById('stat-total').textContent = allFeatures.length.toLocaleString();
    document.getElementById('stat-filtered').textContent = features.length.toLocaleString();
    const now = new Date();
    document.getElementById('stat-time').textContent = now.toLocaleTimeString();
}

function setupMapInteractions() {
    // Click to show details
    felt.onPointerClick({
        handler: (event) => {
            if (event.features && event.features.length > 0) {
                const feature = event.features[0];
                showFeatureDetails(feature);
            }
        }
    });

    // Hover to show tooltip
    felt.onPointerMove({
        handler: (event) => {
            if (event.features && event.features.length > 0) {
                const feature = event.features[0];
                showTooltip(event, feature);
            }
        }
    });
}

function showFeatureDetails(feature) {
    const props = feature.properties;
    const panel = document.getElementById('feature-panel');
    const infoDiv = document.getElementById('feature-info');

    let html = '<div class="feature-detail">';
    for (const [key, value] of Object.entries(props)) {
        html += `
            <div class="detail-row">
                <span class="detail-label">${key}:</span>
                <span class="detail-value">${value}</span>
            </div>
        `;
    }
    html += '</div>';

    infoDiv.innerHTML = html;
    panel.style.display = 'block';
}

function showTooltip(event, feature) {
    const props = feature.properties;
    let tooltip = document.getElementById('map-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'map-tooltip';
        tooltip.className = 'map-tooltip';
        document.body.appendChild(tooltip);
    }

    const firstProp = Object.entries(props)[0];
    tooltip.innerHTML = `<strong>${firstProp[0]}:</strong> ${firstProp[1]}`;
    tooltip.style.display = 'block';
    tooltip.style.left = event.pageX + 15 + 'px';
    tooltip.style.top = event.pageY + 15 + 'px';

    setTimeout(() => {
        if (tooltip) tooltip.style.display = 'none';
    }, 3000);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
});