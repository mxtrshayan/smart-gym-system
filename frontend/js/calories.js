document.addEventListener("DOMContentLoaded", () => {
  
    const searchInput = document.getElementById("foodSearchInput");
    const tableBody = document.getElementById("foodTableBody");
    const tipDisplay = document.getElementById("healthTipDisplay");
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    const statusMessage = document.getElementById("statusMessage");

   
    let allFoodsData = []; 
    let currentDisplayCount = 0; 
    const ITEMS_PER_BATCH = 10; 

  
    fetchFoods();      
    loadHealthTip();   


    let debounceTimer;
    searchInput.addEventListener("keyup", (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const searchTerm = e.target.value;
            fetchFoods(searchTerm);
        }, 300);
    });

  
    loadMoreBtn.addEventListener("click", () => {
        renderNextBatch();
    });

 


    async function fetchFoods(query = "") {
        try {
       
            if(query) statusMessage.innerText = "Searching...";
            
            const response = await fetch(`http://localhost:3000/api/foods?search=${encodeURIComponent(query)}`);
            const foods = await response.json();
            
         
            const seenNames = new Set();
            allFoodsData = foods.filter(food => {
                const normalizedName = food.name.trim().toLowerCase();
                if (seenNames.has(normalizedName)) {
                    return false;
                } else {
                    seenNames.add(normalizedName);
                    return true; 
                }
            });

            allFoodsData.sort((a, b) => {
                return a.name.localeCompare(b.name);
            });

            tableBody.innerHTML = "";
            currentDisplayCount = 0;

            if (allFoodsData.length === 0) {
                statusMessage.innerText = "No foods found.";
                loadMoreBtn.classList.add("hidden");
            } else {
                renderNextBatch();
            }

        } catch (error) {
            console.error("Error fetching foods:", error);
            statusMessage.innerText = "Error loading data.";
        }
    }

    function renderNextBatch() {
        const start = currentDisplayCount;
        const end = start + ITEMS_PER_BATCH;
        
        const batch = allFoodsData.slice(start, end);

        batch.forEach(food => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${food.name}</td>
                <td>${food.calories}</td>
                <td>${food.protein}g</td>
                <td>${food.carbs}g</td>
                <td>${food.fat}g</td>
            `;
            tableBody.appendChild(row);
        });

        currentDisplayCount += batch.length;

        updatePaginationUI();
    }

    function updatePaginationUI() {
        if (currentDisplayCount >= allFoodsData.length) {
            loadMoreBtn.classList.add("hidden");
            statusMessage.innerText = `Showing all ${allFoodsData.length} results.`;
        } else {
            loadMoreBtn.classList.remove("hidden");
            statusMessage.innerText = `Showing ${currentDisplayCount} of ${allFoodsData.length} foods.`;
        }
    }

    async function loadHealthTip() {
        try {
            const response = await fetch('http://localhost:3000/api/tips');
            const data = await response.json();
            
            if (data && data.tip_text) {
                tipDisplay.innerText = `"${data.tip_text}"`;
            } else {
                tipDisplay.innerText = "Stay consistent with your diet!";
            }
        } catch (error) {
            console.error("Error fetching tip:", error);
            tipDisplay.innerText = "Eat healthy, stay fit!";
        }
    }
});