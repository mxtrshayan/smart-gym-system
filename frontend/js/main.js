document.addEventListener("DOMContentLoaded", () => {
    console.log("Smart Gym Website Loaded");

  
    let slideIndex = 1;
    
    if(document.querySelector('.carousel-container')) {
        showSlides(slideIndex);

        setInterval(() => {
            changeSlide(1);
        }, 5000);
    }

    window.changeSlide = function(n) {
        showSlides(slideIndex += n);
    };

    window.currentSlide = function(n) {
        showSlides(slideIndex = n);
    };

    function showSlides(n) {
        let i;
        let slides = document.getElementsByClassName("carousel-slide");
        let dots = document.getElementsByClassName("dot");

        if (n > slides.length) {slideIndex = 1}    
        if (n < 1) {slideIndex = slides.length}
        
        for (i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";  
        }
        
        for (i = 0; i < dots.length; i++) {
            dots[i].className = dots[i].className.replace(" active-dot", "");
        }
        
        slides[slideIndex-1].style.display = "block";  
        dots[slideIndex-1].className += " active-dot";
    }
});