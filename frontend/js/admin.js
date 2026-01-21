document.addEventListener("DOMContentLoaded", () => {
    loadUsers();
    loadTrainers(); 
    loadFoods();
    loadTips();
});


let allUsers = [];
let allTrainers = [];

let allUniqueFoods = []; 
let currentFoodCount = 0;
const FOOD_BATCH_SIZE = 10;

function showSection(sectionId) {
    document.querySelectorAll('section').forEach(sec => sec.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
    
    document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active-tab'));
    if(event && event.currentTarget) event.currentTarget.classList.add('active-tab');

    if(window.innerWidth <= 768) {
        document.getElementById("adminSidebar").classList.remove("active");
    }
}

function toggleSidebar() {
    document.getElementById("adminSidebar").classList.toggle("active");
}


async function loadUsers() {
    try {
        const res = await fetch('http://localhost:3000/api/admin/users');
        allUsers = await res.json();
        allUsers.sort((a, b) => a.id - b.id);
        renderUsers(allUsers);
    } catch (e) { console.error(e); }
}

function renderUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        tbody.innerHTML += `
            <tr>
                <td>${user.id}</td>
                <td>${user.first_name} ${user.last_name}</td>
                <td>${user.email}</td>
                <td>${user.phone || '-'}</td>
                <td>${user.age || '-'} / ${user.gender || '-'}</td> <td>${user.fitness_goal}</td>
                <td>${user.trainer_name || '<span style="color:#aaa;">None</span>'}</td>
                <td>${user.booking_time || '-'}</td>
                <td>
                    <div class="action-btns">
                        <button class="edit-btn" onclick="editUser(${user.id})"><i class="fas fa-edit"></i></button>
                        <button class="delete-btn" onclick="deleteItem('users', ${user.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>`;
    });
}

function filterUsers() {
    const term = document.getElementById('userSearch').value.toLowerCase();
    
    const filtered = allUsers.filter(u => 
        u.id.toString().includes(term) ||
        u.first_name.toLowerCase().includes(term) || 
        u.last_name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );
    renderUsers(filtered);
}

const userModal = document.getElementById("userModal");
const userForm = document.getElementById("userForm");

function openUserModal() {
    userModal.style.display = "block";
    document.getElementById("userModalTitle").innerText = "Add New User";
    document.getElementById("uId").value = ""; 
    userForm.reset();
    
    document.getElementById("uGender").value = "Male"; 
    document.getElementById("uAge").value = "";       
    document.getElementById("uTrainer").innerHTML = '<option value="">Select a Goal first</option>';
    document.getElementById("uTrainer").disabled = true;
    document.getElementById("uTime").value = "";
}

function closeUserModal() {
    userModal.style.display = "none";
}

function editUser(id) {
    const user = allUsers.find(u => u.id === id);
    if (!user) return;

    document.getElementById("uId").value = user.id;
    document.getElementById("uFname").value = user.first_name;
    document.getElementById("uLname").value = user.last_name;
    document.getElementById("uEmail").value = user.email;
    document.getElementById("uPhone").value = user.phone || "";
    
    document.getElementById("uAge").value = user.age || "";
    document.getElementById("uGender").value = user.gender || "Male";

    const goalSelect = document.getElementById("uGoal");
    goalSelect.value = user.fitness_goal;

    updateTrainerDropdown();

    if (user.trainer_name) {
        const trainerSelect = document.getElementById("uTrainer");
        for (let i = 0; i < trainerSelect.options.length; i++) {
            if (trainerSelect.options[i].text.includes(user.trainer_name)) {
                trainerSelect.selectedIndex = i;
                break;
            }
        }
        updateTimeSlot(); 
    }

    document.getElementById("userModalTitle").innerText = `Edit User #${id}`;
    userModal.style.display = "block";
}

function updateTrainerDropdown() {
    const goal = document.getElementById("uGoal").value;
    const trainerSelect = document.getElementById("uTrainer");
    const timeInput = document.getElementById("uTime");

    trainerSelect.innerHTML = '<option value="">Select Trainer</option>';
    timeInput.value = "";

    if (!goal) {
        trainerSelect.disabled = true;
        return;
    }

    const matchingTrainers = allTrainers.filter(t => t.specialty.includes(goal));

    if (matchingTrainers.length === 0) {
        trainerSelect.innerHTML = '<option value="">No trainers found</option>';
        trainerSelect.disabled = true;
    } else {
        trainerSelect.disabled = false;
        matchingTrainers.forEach(t => {
            const option = document.createElement("option");
            option.value = t.id;
            option.text = `${t.name} (${t.availability})`;
            trainerSelect.appendChild(option);
        });
    }
}

function updateTimeSlot() {
    const trainerId = document.getElementById("uTrainer").value;
    const trainer = allTrainers.find(t => t.id == trainerId);
    
    if (trainer) {
        document.getElementById("uTime").value = trainer.availability;
    } else {
        document.getElementById("uTime").value = "";
    }
}

userForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const id = document.getElementById("uId").value;
    const trainerId = document.getElementById("uTrainer").value;
    const timeSlot = document.getElementById("uTime").value;

    const userData = {
        firstName: document.getElementById("uFname").value,
        lastName: document.getElementById("uLname").value,
        email: document.getElementById("uEmail").value,
        phone: document.getElementById("uPhone").value,
        age: document.getElementById("uAge").value,
        gender: document.getElementById("uGender").value, 
        fitnessGoal: document.getElementById("uGoal").value,
        trainerId: trainerId || null,
        bookingTime: timeSlot || null
    };

    try {
        if (id) {
            const res = await fetch(`http://localhost:3000/api/admin/users/${id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(userData)
            });
            if(res.ok) {
                alert("User Updated!");
                closeUserModal();
                loadUsers();
            }
        } else {
            const regRes = await fetch(`http://localhost:3000/api/register`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(userData)
            });
            const regData = await regRes.json();

            if (regData.success) {
                if (trainerId) {
                    await fetch(`http://localhost:3000/api/book-trainer`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            userId: regData.userId,
                            trainerId: trainerId,
                            timeSlot: timeSlot
                        })
                    });
                }
                alert("User Added Successfully!");
                closeUserModal();
                loadUsers();
            } else {
                alert("Error: " + regData.message);
            }
        }
    } catch(err) { console.error(err); }
});


async function loadTrainers() {
    try {
        const res = await fetch('http://localhost:3000/api/trainers');
        allTrainers = await res.json();
        allTrainers.sort((a, b) => a.id - b.id);
        renderTrainers(allTrainers);
    } catch (e) { console.error(e); }
}

function renderTrainers(trainers) {
    const list = document.getElementById('trainersList');
    list.innerHTML = '';
    if(trainers.length === 0) { list.innerHTML = '<p style="padding:15px;">No trainers found.</p>'; return; }

    trainers.forEach(t => {
        list.innerHTML += `
            <li>
                <div style="flex: 1;">
                    <div style="font-weight:bold; color:#2c3e50; font-size:1.1rem;">#${t.id} - ${t.name}</div>
                    <div style="font-size:0.9rem; color:#555; margin-top:5px;">
                        <span style="color:#e74c3c; font-weight:600;">${t.specialty}</span> &bull; ${t.experience}
                    </div>
                    <div style="font-size:0.85rem; color:#777; margin-top:2px;"><i class="far fa-clock"></i> ${t.availability}</div>
                </div>
                <div class="action-btns">
                    <button class="edit-btn" onclick="editTrainer(${t.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteItem('trainers', ${t.id})">Delete</button>
                </div>
            </li>`;
    });
}

function filterTrainers() {
    const term = document.getElementById('trainerSearch').value.toLowerCase();
    const filtered = allTrainers.filter(t => t.name.toLowerCase().includes(term) || t.id.toString().includes(term));
    renderTrainers(filtered);
}

function editTrainer(id) {
    const trainer = allTrainers.find(t => t.id === id);
    if (!trainer) return;
    document.getElementById("tId").value = trainer.id;
    document.getElementById("tName").value = trainer.name;
    document.getElementById("tSpecialty").value = trainer.specialty;
    document.getElementById("tExp").value = trainer.experience;
    document.getElementById("tAvail").value = trainer.availability;
    document.getElementById("trainerFormTitle").innerText = `Edit Trainer #${id}`;
    document.getElementById("tBtn").innerText = "Update Trainer";
    document.getElementById("tCancel").style.display = "inline-block";
    document.getElementById("trainersSection").scrollIntoView({ behavior: "smooth" });
}

function resetTrainerForm() {
    document.getElementById("tId").value = "";
    document.getElementById("tName").value = "";
    document.getElementById("tSpecialty").value = "";
    document.getElementById("tExp").value = "";
    document.getElementById("tAvail").value = "";
    document.getElementById("trainerFormTitle").innerText = "Add New Trainer";
    document.getElementById("tBtn").innerText = "Add Trainer";
    document.getElementById("tCancel").style.display = "none";
}

async function saveTrainer() {
    const id = document.getElementById("tId").value;
    const data = {
        name: document.getElementById("tName").value,
        specialty: document.getElementById("tSpecialty").value,
        experience: document.getElementById("tExp").value,
        availability: document.getElementById("tAvail").value
    };
    if(!data.name || !data.specialty) return alert("Please fill required fields");

    const url = id ? `http://localhost:3000/api/admin/trainers/${id}` : `http://localhost:3000/api/admin/trainers`;
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, { method: method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
        if (res.ok) {
            alert(id ? "Trainer Updated! Users synced." : "Trainer Added!");
            resetTrainerForm();
            loadTrainers();
        }
    } catch(e) { console.error(e); }
}


async function loadFoods() {
    try {
        const res = await fetch('http://localhost:3000/api/foods');
        const foods = await res.json();
        
        const seen = new Set();
        allUniqueFoods = foods.filter(f => {
            const lowerName = f.name.toLowerCase().trim();
            if(seen.has(lowerName)) return false;
            seen.add(lowerName);
            return true;
        });
        allUniqueFoods.sort((a, b) => a.id - b.id);
        
        currentFoodCount = 0;
        document.getElementById('foodsList').innerHTML = '';
        loadMoreFoods();
    } catch(e) { console.error(e); }
}

function loadMoreFoods() {
    const list = document.getElementById('foodsList');
    const btn = document.getElementById('loadMoreFoodsBtn');
    const start = currentFoodCount;
    const end = start + FOOD_BATCH_SIZE;
    const batch = allUniqueFoods.slice(start, end);

    batch.forEach(f => {
        list.innerHTML += `
            <li>
                <span>#${f.id} - ${f.name} (${f.calories}kcal)</span>
                <button class="delete-btn" onclick="deleteItem('foods', ${f.id})">Delete</button>
            </li>`;
    });
    currentFoodCount += batch.length;
    btn.style.display = (currentFoodCount >= allUniqueFoods.length) ? 'none' : 'inline-block';
}

function filterFoods() {
    const term = document.getElementById('foodSearch').value.toLowerCase();
    const list = document.getElementById('foodsList');
    list.innerHTML = '';
    if(!term) { currentFoodCount = 0; loadMoreFoods(); return; }

    const filtered = allUniqueFoods.filter(f => f.name.toLowerCase().includes(term));
    filtered.forEach(f => {
        list.innerHTML += `
            <li>
                <span>#${f.id} - ${f.name} (${f.calories}kcal)</span>
                <button class="delete-btn" onclick="deleteItem('foods', ${f.id})">Delete</button>
            </li>`;
    });
    document.getElementById('loadMoreFoodsBtn').style.display = 'none';
}

async function addFood() {
    const nameInput = document.getElementById('fName');
    const msgBox = document.getElementById('foodMsg');
    const name = nameInput.value.trim();
    if(!name) return;

    if (allUniqueFoods.some(f => f.name.toLowerCase() === name.toLowerCase())) {
        msgBox.innerText = "Error: Food exists!";
        msgBox.className = "status-msg error";
        return;
    }

    const data = {
        name: name,
        calories: document.getElementById('fCal').value,
        protein: document.getElementById('fProt').value,
        carbs: document.getElementById('fCarb').value,
        fat: document.getElementById('fFat').value
    };

    try {
        const res = await fetch('http://localhost:3000/api/admin/foods', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
        if (res.ok) {
            nameInput.value = ""; document.querySelectorAll('#foodsSection input[type=number]').forEach(i => i.value = "");
            msgBox.innerText = "Food Added!"; msgBox.className = "status-msg success";
            loadFoods();
            setTimeout(() => msgBox.innerText = "", 3000);
        }
    } catch(e) { console.error(e); }
}


async function loadTips() {
    try {
        const res = await fetch('http://localhost:3000/api/admin/tips');
        const tips = await res.json();
        const list = document.getElementById('tipsList');
        list.innerHTML = '';
        tips.forEach(t => {
            list.innerHTML += `<li><span>${t.tip_text}</span><button class="delete-btn" onclick="deleteItem('health_tips', ${t.id})">Delete</button></li>`;
        });
    } catch(e) {}
}

async function addTip() {
    const input = document.getElementById('tipInput');
    if(!input.value.trim()) return;
    await fetch('http://localhost:3000/api/admin/tips', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ tip_text: input.value }) });
    input.value = ""; loadTips();
}

async function deleteItem(table, id) {
    if(confirm("Delete this item?")) {
        await fetch(`http://localhost:3000/api/admin/delete/${table}/${id}`, { method: 'DELETE' });
        loadUsers(); loadTrainers(); loadFoods(); loadTips();
    }
}

window.onclick = function(event) { if (event.target == userModal) closeUserModal(); }