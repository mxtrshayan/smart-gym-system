document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registrationForm");
    const messageBox = document.getElementById("formMessage");
    const trainerSection = document.getElementById("trainerSection");
    const trainersList = document.getElementById("trainersList");
    const confirmBtn = document.getElementById("confirmBookingBtn");

    let currentUserId = null;
    let selectedTrainerId = null;
    let selectedTimeSlot = null;

    form.addEventListener("submit", async function(event) {
        event.preventDefault();
        
        const userData = {
            firstName: document.getElementById("firstName").value.trim(),
            lastName: document.getElementById("lastName").value.trim(),
            email: document.getElementById("email").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            age: document.getElementById("age").value,
            gender: document.getElementById("gender").value,
            fitnessGoal: document.getElementById("fitnessGoal").value
        };

        if (!userData.firstName || !userData.email || !userData.fitnessGoal) {
            showMessage("Please fill required fields.", "error");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            const result = await response.json();

            if (result.success) {
                currentUserId = result.userId;
                showMessage("Registration successful! Checking availability...", "success");
                
                form.style.display = 'none';
                trainerSection.style.display = 'block';
                document.getElementById("userGoalDisplay").innerText = userData.fitnessGoal;
                
                loadTrainers(userData.fitnessGoal);
            } else {
                showMessage(result.message, "error");
            }
        } catch (error) {
            console.error(error);
            showMessage("Server error during registration.", "error");
        }
    });

    async function loadTrainers(goal) {
        if (!goal) return; 

        try {
            const response = await fetch(`http://localhost:3000/api/trainers?goal=${encodeURIComponent(goal)}`);
            const trainers = await response.json();

            trainersList.innerHTML = "";

            const matchingTrainers = trainers.filter(t => 
                t.specialty.toLowerCase().includes(goal.toLowerCase())
            );

            if (matchingTrainers.length === 0) {
                trainersList.innerHTML = `
                    <div style="text-align:center; padding: 20px; color: #c0392b; border: 1px solid #eba5a5; background: #fcebeb; border-radius: 5px;">
                        <strong>No trainers available.</strong><br>
                        We currently don't have trainers specializing in "${goal}".
                    </div>`;
                
                document.getElementById("bookingConfirmation").style.display = "none";

                showMessage("Registration complete. (No trainers assigned)", "error");

            } else {
                renderTrainerCards(matchingTrainers);
                
                showMessage("Registration successful! Please select a trainer.", "success");
            }

        } catch (error) {
            console.error(error);
            trainersList.innerHTML = "<p>Error loading trainers.</p>";
            showMessage("Error loading trainer list.", "error");
        }
    }

    function renderTrainerCards(trainers) {
        trainers.forEach(trainer => {
            const div = document.createElement("div");
            div.className = "trainer-card";
            div.innerHTML = `
                <h4>${trainer.name}</h4>
                <p><strong>Specialty:</strong> ${trainer.specialty}</p>
                <p><strong>Experience:</strong> ${trainer.experience}</p>
                <p><strong>Time:</strong> ${trainer.availability}</p>
            `;
            
            div.addEventListener("click", () => {
                document.querySelectorAll('.trainer-card').forEach(c => c.classList.remove('selected'));
                div.classList.add('selected');

                selectedTrainerId = trainer.id;
                selectedTimeSlot = trainer.availability; 

                document.getElementById("bookingConfirmation").style.display = "block";
                document.getElementById("selectedTrainerName").innerText = trainer.name;
                document.getElementById("selectedTrainerTime").innerText = trainer.availability;
            });

            trainersList.appendChild(div);
        });
    }

    confirmBtn.addEventListener("click", async () => {
        if (!currentUserId || !selectedTrainerId) {
            alert("Please select a trainer first.");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/book-trainer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUserId,
                    trainerId: selectedTrainerId,
                    timeSlot: selectedTimeSlot
                })
            });
            const result = await response.json();

            if (result.success) {
                alert("Booking Confirmed! Welcome to the gym.");
                window.location.href = "index.html"; 
            } else {
                alert("Booking failed: " + result.message);
            }
        } catch (error) {
            alert("Error connecting to server.");
        }
    });

    function showMessage(text, type) {
        messageBox.textContent = text;
        messageBox.className = type;
    }
});