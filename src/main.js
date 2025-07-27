import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
    onNeedRefresh() {
        // Add your logic for prompting user to refresh
        if (confirm('New content available. Reload?')) {
            updateSW();
        }
    },
    onOfflineReady() {
        console.log('App ready to work offline');
    },
});

const container = document.getElementById('container');
let values = [200, 400, 600, 800, 1000];
let categories = Array(5).fill().map(() => ({
    name: "",
    q: Array(5).fill(""),
    a: Array(5).fill("")
}));

// Create wrapper for values and grid
const gameWrapper = document.createElement('div');
gameWrapper.className = 'game-wrapper';

// Create value inputs container
const valueContainer = document.createElement('div');
valueContainer.className = 'value-container';
for (let i = 0; i < 5; i++) {
    const valueInput = document.createElement('input');
    valueInput.type = 'number';
    valueInput.value = values[i];
    valueInput.className = 'value-input';
    valueInput.dataset.row = i;
    valueInput.addEventListener('change', (e) => {
        values[i] = parseInt(e.target.value);
        updateGridValues(i);
    });
    valueContainer.appendChild(valueInput);
}
gameWrapper.appendChild(valueContainer);

// Create category name inputs
const categoryContainer = document.createElement('div');
categoryContainer.className = 'category-container';
// In the category creation section, add this before the loop:
const placeholderInput = document.createElement('input');
placeholderInput.type = 'text';
placeholderInput.className = 'category-input';
placeholderInput.disabled = true;
categoryContainer.appendChild(placeholderInput);

// Then continue with your existing category input loop...
for (let i = 0; i < 5; i++) {
    const categoryInput = document.createElement('input');
    categoryInput.type = 'text';
    categoryInput.placeholder = `CATEGORY ${i + 1} NAME`;
    categoryInput.className = 'category-input';
    categoryInput.dataset.index = i;
    
    // Convert to uppercase while typing
    categoryInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
    });
    
    categoryInput.addEventListener('change', (e) => {
        categories[i].name = e.target.value.toUpperCase();
    });
    categoryContainer.appendChild(categoryInput);
}
document.body.insertBefore(categoryContainer, container);

// Create the grid container
const gridContainer = document.createElement('div');
gridContainer.id = 'grid-container';
gridContainer.className = 'grid-container';

// In the grid creation section, replace the button creation code:
for (let i = 0; i < 5; i++) {
    for(let j = 0; j < 5; j++) {
        const button = document.createElement('button');
        button.className = `cell cell-${i}-${j}`;
        button.dataset.row = i.toString();
        button.dataset.col = j.toString();
        button.innerHTML = `<span class="question-text"></span>`;
        button.addEventListener('click', openPopup);
        gridContainer.appendChild(button);
    }
}
gameWrapper.appendChild(gridContainer);
document.body.insertBefore(gameWrapper, document.querySelector('.save-json-btn'));

// Update the updateGridValues function:
function updateGridValues(row) {
    const cells = document.querySelectorAll(`.cell-${row}-\\d`);
    cells.forEach(cell => {
        const questionSpan = cell.querySelector('.question-text');
        const currentText = questionSpan.textContent;
        cell.querySelector('.question-text').textContent = currentText;
    });
}

// Create popup
const popup = document.createElement('div');
popup.className = 'popup';
popup.innerHTML = `
    <div class="popup-content">
        <span class="close">&times;</span>
        <div class="input-group">
            <label for="question">QUESTION:</label>
            <input type="text" id="question" placeholder="ENTER YOUR QUESTION">
        </div>
        <div class="input-group">
            <label for="answer">ANSWER:</label>
            <input type="text" id="answer" placeholder="ENTER YOUR ANSWER">
        </div>
        <button class="save-btn">SAVE</button>
    </div>
`;
document.body.appendChild(popup);

// Add input event listeners to the popup inputs after creation
const questionInput = document.getElementById('question');
const answerInput = document.getElementById('answer');

questionInput.addEventListener('input', (e) => {
    const ss = e.target.selectionStart;
    const se = e.target.selectionEnd;
    e.target.value = e.target.value.toUpperCase();
    e.target.selectionStart = ss;
    e.target.selectionEnd = se;
});

answerInput.addEventListener('input', (e) => {
    const ss = e.target.selectionStart;
    const se = e.target.selectionEnd;
    e.target.value = e.target.value.toUpperCase();
    e.target.selectionStart = ss;
    e.target.selectionEnd = se;
});

// Popup functionality
function openPopup(event) {
    const button = event.target.closest('.cell');
    const col = parseInt(button.dataset.col);
    const row = parseInt(button.dataset.row);
    popup.style.display = 'block';
    
    // Pre-fill existing values if they exist
    document.getElementById('question').value = categories[col].q[row] || '';
    document.getElementById('answer').value = categories[col].a[row] || '';
    
    const saveBtn = popup.querySelector('.save-btn');
    saveBtn.onclick = () => {
        const question = document.getElementById('question').value;
        const answer = document.getElementById('answer').value;
        
        // Store values in our categories structure
        categories[col].q[row] = question.toUpperCase();
        categories[col].a[row] = answer.toUpperCase();
        
        // Update the button text to show the question
        const questionSpan = button.querySelector('.question-text');
        questionSpan.textContent = question.toUpperCase();
        
        // Clear inputs
        document.getElementById('question').value = '';
        document.getElementById('answer').value = '';
        
        popup.style.display = 'none';
    };
}

// Create save to JSON button
const saveJsonBtn = document.createElement('button');
saveJsonBtn.textContent = 'SAVE TO JSON';
saveJsonBtn.className = 'save-json-btn';
saveJsonBtn.addEventListener('click', saveToJson);
document.body.appendChild(saveJsonBtn);

// Create import from JSON button
const importJsonBtn = document.createElement('button');
importJsonBtn.textContent = 'IMPORT FROM JSON';
importJsonBtn.className = 'import-json-btn';
importJsonBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = importFromJson;
    input.click();
});
document.body.appendChild(importJsonBtn);

// Function to save data to JSON file
function saveToJson() {
    const jsonData = {
        values: values,
        categories: categories
    };
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'triviality-game.json';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
}

// Function to import data from JSON file
function importFromJson(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const jsonData = JSON.parse(e.target.result);
                
                // Validate the JSON structure
                if (!jsonData.values || !jsonData.categories || 
                    !Array.isArray(jsonData.values) || !Array.isArray(jsonData.categories)) {
                    throw new Error('Invalid JSON format');
                }

                // Update values
                values = jsonData.values;
                const valueInputs = document.querySelectorAll('.value-input');
                valueInputs.forEach((input, i) => {
                    input.value = values[i];
                });

                // Update categories
                categories = jsonData.categories;
                const categoryInputs = document.querySelectorAll('.category-input:not([disabled])');
                categoryInputs.forEach((input, i) => {
                    input.value = categories[i].name;
                });

                // Update grid
                for (let i = 0; i < 5; i++) {
                    for (let j = 0; j < 5; j++) {
                        const cell = document.querySelector(`.cell-${j}-${i}`);
                        const questionSpan = cell.querySelector('.question-text');
                        questionSpan.textContent = categories[i].q[j];
                    }
                }

                alert('Game data imported successfully!');
            } catch (error) {
                alert('Error importing JSON file: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
}

// Close popup when clicking the X
const closeBtn = popup.querySelector('.close');
closeBtn.onclick = () => {
    popup.style.display = 'none';
};

// Close popup when clicking outside
window.onclick = (event) => {
    if (event.target === popup) {
        popup.style.display = 'none';
    }
};

// Create copy to clipboard button
const copyClipboardBtn = document.createElement('button');
copyClipboardBtn.textContent = 'COPY TO CLIPBOARD';
copyClipboardBtn.className = 'copy-clipboard-btn';
copyClipboardBtn.addEventListener('click', copyToClipboard);
document.body.appendChild(copyClipboardBtn);

// Function to copy data to clipboard
function copyToClipboard() {
    const jsonData = {
        values: values,
        categories: categories
    };
    
    const jsonString = JSON.stringify(jsonData, null, 2);
    
    navigator.clipboard.writeText(jsonString)
        .then(() => {
            // Temporarily change button text to indicate success
            const originalText = copyClipboardBtn.textContent;
            copyClipboardBtn.textContent = 'COPIED!';
            setTimeout(() => {
                copyClipboardBtn.textContent = originalText;
            }, 1500);
        })
        .catch(err => {
            alert('Failed to copy to clipboard: ' + err);
        });
}