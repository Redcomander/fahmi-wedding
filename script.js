// script.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Handle URL Parameters for Guest Name
    const urlParams = new URLSearchParams(window.location.search);
    const guestNameParam = urlParams.get('to');
    const guestNameElement = document.getElementById('guest-name');
    
    if (guestNameParam) {
        // Replace + with space and decode URI components if any
        const decodedName = decodeURIComponent(guestNameParam.replace(/\+/g, ' '));
        guestNameElement.textContent = decodedName;
    } else {
        guestNameElement.textContent = "Tamu Undangan";
    }

    // 2. Open Invitation (Cover Screen)
    const btnOpen = document.getElementById('btn-open');
    const coverScreen = document.getElementById('cover-screen');
    const mainContent = document.getElementById('main-content');
    const bgMusic = document.getElementById('bg-music');
    const btnMusic = document.getElementById('btn-music');
    let isMusicPlaying = false;

    btnOpen.addEventListener('click', () => {
        coverScreen.classList.add('slide-up');
        mainContent.classList.remove('hidden');
        
        // Try to play music
        bgMusic.play().then(() => {
            isMusicPlaying = true;
            btnMusic.classList.remove('paused');
        }).catch(err => {
            console.log("Auto-play prevented by browser:", err);
            isMusicPlaying = false;
            btnMusic.classList.add('paused');
        });

        // After animation completes, we can hide it from DOM to prevent scrolling issues
        setTimeout(() => {
            coverScreen.style.display = 'none';
        }, 1000);
        
        // Trigger initial scroll animations
        handleScrollAnimation();
    });

    // 3. Background Music Toggle
    btnMusic.addEventListener('click', () => {
        if (isMusicPlaying) {
            bgMusic.pause();
            btnMusic.classList.add('paused');
        } else {
            bgMusic.play();
            btnMusic.classList.remove('paused');
        }
        isMusicPlaying = !isMusicPlaying;
    });

    // 4. Countdown Timer
    const weddingDate = new Date("March 25, 2026 10:00:00").getTime();
    
    const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = weddingDate - now;
        
        if (distance < 0) {
            document.getElementById('cd-days').innerText = "00";
            document.getElementById('cd-hours').innerText = "00";
            document.getElementById('cd-minutes').innerText = "00";
            document.getElementById('cd-seconds').innerText = "00";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('cd-days').innerText = days < 10 ? '0' + days : days;
        document.getElementById('cd-hours').innerText = hours < 10 ? '0' + hours : hours;
        document.getElementById('cd-minutes').innerText = minutes < 10 ? '0' + minutes : minutes;
        document.getElementById('cd-seconds').innerText = seconds < 10 ? '0' + seconds : seconds;
    };
    
    // Update every second
    setInterval(updateCountdown, 1000);
    updateCountdown(); // Initial call

    // 5. Scroll Animations (Intersection Observer)
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: Stop observing once animated
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animateElements.forEach(el => scrollObserver.observe(el));
    
    // Fallback for elements immediately in view on load/open
    const handleScrollAnimation = () => {
        animateElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if(rect.top < window.innerHeight - 50) {
                el.classList.add('is-visible');
            }
        });
    }

    // 6. Copy Rekening Function
    window.copyText = function(text, btnElement) {
        navigator.clipboard.writeText(text).then(() => {
            const originalHTML = btnElement.innerHTML;
            btnElement.innerHTML = '<i class="fa-solid fa-check"></i> Berhasil Disalin';
            btnElement.classList.add('copied');
            
            setTimeout(() => {
                btnElement.innerHTML = originalHTML;
                btnElement.classList.remove('copied');
            }, 3000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert("Gagal menyalin. Silakan salin manual.");
        });
    };

    // 8. RSVP Form Handling
    const rsvpForm = document.getElementById('rsvp-form');
    const rsvpStatus = document.getElementById('rsvp-status');
    
    const renderRsvpStats = () => {
        const statsContainer = document.getElementById('rsvp-stats-container');
        if(!statsContainer) return;
        
        const rsvps = JSON.parse(localStorage.getItem('wedding-rsvps') || '[]');
        let hadir = 0, tidakHadir = 0, ragu = 0;
        
        rsvps.forEach(r => {
            if(r.attendance === 'Hadir') hadir += r.guests;
            else if(r.attendance === 'Tidak Hadir') tidakHadir++;
            else ragu++;
        });
        
        statsContainer.innerHTML = `
            <div class="rsvp-stats">
                <div class="stat-item">
                    <span class="stat-num">${hadir}</span>
                    <span class="stat-label">Hadir</span>
                </div>
                <div class="stat-item">
                    <span class="stat-num">${tidakHadir}</span>
                    <span class="stat-label">Tidak Hadir</span>
                </div>
                <div class="stat-item">
                    <span class="stat-num">${ragu}</span>
                    <span class="stat-label">Ragu</span>
                </div>
            </div>
        `;
    };
    
    // Initial Render
    renderRsvpStats();

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const attendance = document.getElementById('attendance').value;
            const guests = parseInt(document.getElementById('guests').value);
            
            // Save to localStorage
            const savedRsvps = JSON.parse(localStorage.getItem('wedding-rsvps') || '[]');
            savedRsvps.push({ name, attendance, guests, time: new Date().getTime() });
            localStorage.setItem('wedding-rsvps', JSON.stringify(savedRsvps));
            
            // Re-render stats
            renderRsvpStats();
            
            rsvpStatus.textContent = `Terima kasih ${name}, konfirmasi kehadiran Anda (${attendance}) telah disimpan.`;
            rsvpStatus.className = 'form-status success';
            rsvpStatus.classList.remove('hidden');
            
            // Reset form
            setTimeout(() => {
                rsvpForm.reset();
                setTimeout(() => rsvpStatus.classList.add('hidden'), 3000);
            }, 3000);
        });
    }

    // 9. Wishes Form Handling
    const wishesForm = document.getElementById('wishes-form');
    const wishesList = document.getElementById('wishes-list');

    // Load saved wishes
    const loadWishes = () => {
        const savedWishes = JSON.parse(localStorage.getItem('wedding-wishes') || '[]');
        
        // Add default fake wish if empty for demo purposes
        if (savedWishes.length === 0) {
            addWishToList(999, "Keluarga Besar", "Semoga menjadi keluarga yang sakinah, mawaddah, warahmah. Aamiin.", "Beberapa saat yang lalu");
        } else {
            // Prepend saved wishes
            savedWishes.forEach(wish => {
                // Backward compatibility for old wishes without id
                const id = wish.id || Math.floor(Math.random() * 1000000);
                addWishToList(id, wish.name, wish.message, wish.time);
            });
        }
    };

    const addWishToList = (id, name, message, timeText = "Baru saja") => {
        const wishItem = document.createElement('div');
        wishItem.className = 'wish-item';
        
        wishItem.innerHTML = `
            <div class="wish-header">
                <strong>${name}</strong>
            </div>
            <p class="wish-text">${message}</p>
            <span class="wish-time">${timeText}</span>
        `;
        wishesList.insertBefore(wishItem, wishesList.firstChild);
    };

    if (wishesForm) {
        // Clear hardcoded wishes first
        wishesList.innerHTML = '';
        loadWishes();
        
        wishesForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('wish-name');
            const messageInput = document.getElementById('wish-message');
            
            const newWish = {
                id: Date.now(),
                name: nameInput.value,
                message: messageInput.value,
                time: "Baru saja"
            };
            
            // Save to localStorage
            const savedWishes = JSON.parse(localStorage.getItem('wedding-wishes') || '[]');
            savedWishes.unshift(newWish);
            localStorage.setItem('wedding-wishes', JSON.stringify(savedWishes));
            
            addWishToList(newWish.id, newWish.name, newWish.message);
            
            wishesForm.reset();
        });
    }
});
