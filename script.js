// ==========================================================================
// Sankat Mochan Group of Institution - Interactive Script (script.js)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    // 1. Navbar Active Link Toggle
    const navLinks = document.querySelectorAll(".nav-links a");
    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.forEach((l) => l.classList.remove("active"));
            link.classList.add("active");
        });
    });

    // Helper: Reliable Autoplay across Desktop, Mobile, Safari & In-App Browsers
    function setupReliableHeroVideo(videoEl) {
        if (!videoEl) return;
        let hasFinishedOnce = false;
        let hasStartedPlaying = false;

        videoEl.muted = true;
        videoEl.defaultMuted = true;
        videoEl.volume = 0;
        videoEl.playsInline = true;
        videoEl.setAttribute("muted", "");
        videoEl.setAttribute("playsinline", "");
        videoEl.setAttribute("webkit-playsinline", "");

        function isVisible(el) {
            return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
        }

        function tryPlay() {
            if (hasFinishedOnce || !isVisible(videoEl)) return;
            const playPromise = videoEl.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        hasStartedPlaying = true;
                    })
                    .catch(() => {
                        // Strict mobile browser (e.g. Safari Low Power / Data Saver): start on first touch/click
                        const unlock = () => {
                            if (!hasFinishedOnce && !hasStartedPlaying && isVisible(videoEl)) {
                                videoEl.muted = true;
                                videoEl.play().catch(() => {});
                            }
                            window.removeEventListener("touchstart", unlock);
                            window.removeEventListener("click", unlock);
                            window.removeEventListener("scroll", unlock);
                        };
                        window.addEventListener("touchstart", unlock, { once: true, passive: true });
                        window.addEventListener("click", unlock, { once: true, passive: true });
                        window.addEventListener("scroll", unlock, { once: true, passive: true });
                    });
            }
        }

        videoEl.addEventListener("playing", () => {
            hasStartedPlaying = true;
        });

        videoEl.addEventListener("ended", () => {
            hasFinishedOnce = true;
            videoEl.currentTime = 0; // स्टार्टिंग फ्रेम पर सेट करें
            videoEl.pause();         // स्टार्टिंग फ्रेम पर लॉक/स्टॉप करें
        });

        // Allow external replay (like Recap button) to reset state
        videoEl._resetHeroState = () => {
            hasFinishedOnce = false;
            hasStartedPlaying = false;
        };

        if (videoEl.readyState >= 2) {
            tryPlay();
        } else {
            videoEl.addEventListener("canplay", tryPlay, { once: true });
            tryPlay();
        }
    }

    // 2. Hero Background Video: Play 1 time and lock on the starting frame
    const heroVideo = document.getElementById("heroBgVideo");
    setupReliableHeroVideo(heroVideo);

    // 3. Right Side Hero Visual Automatic Slider (3 Slides)
    // पहली बार तीनों स्लाइड 3-3 सेकंड में दिखेंगी, उसके बाद 5 सेकंड, और फिर 9 सेकंड के बाद स्लाइड बदलेगी
    const slides = document.querySelectorAll(".hero-slide");
    let currentSlide = 0;
    let transitionCount = 0;

    function getNextDelay() {
        if (transitionCount < 2) {
            return 3000; // पहली बार तीनों स्लाइड दिखने तक: 3 सेकंड
        } else if (transitionCount === 2) {
            return 5000; // तीनों स्लाइड दिखने के बाद: 5 सेकंड
        } else {
            return 9000; // उसके बाद: 9 सेकंड
        }
    }

    function scheduleNextSlide() {
        const delay = getNextDelay();
        setTimeout(() => {
            slides.forEach((s) => s.classList.remove("prev"));
            slides[currentSlide].classList.remove("active");
            slides[currentSlide].classList.add("prev");

            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add("active");

            transitionCount++;
            scheduleNextSlide();
        }, delay);
    }

    if (slides.length > 0) {
        scheduleNextSlide();
    }

    // 4. Our Expert Teachers Carousel (4 cards visible, auto-slides slowly + slide buttons)
    const teachersTrack = document.getElementById("teachersTrack");
    const teacherCards = document.querySelectorAll("#teachersTrack .teacher-card");
    const teacherPrev = document.getElementById("teacherPrev");
    const teacherNext = document.getElementById("teacherNext");
    let teacherIndex = 0;
    const visibleCards = 4;

    function updateTeachersCarousel() {
        if (!teachersTrack || teacherCards.length === 0) return;
        const cardWidth = teacherCards[0].getBoundingClientRect().width;
        const gap = 18;
        const offset = teacherIndex * (cardWidth + gap);
        teachersTrack.style.transform = `translateX(-${offset}px)`;
    }

    function nextTeacherSlide() {
        const maxIndex = Math.max(0, teacherCards.length - visibleCards);
        if (teacherIndex < maxIndex) {
            teacherIndex++;
        } else {
            teacherIndex = 0;
        }
        updateTeachersCarousel();
    }

    function prevTeacherSlide() {
        const maxIndex = Math.max(0, teacherCards.length - visibleCards);
        if (teacherIndex > 0) {
            teacherIndex--;
        } else {
            teacherIndex = maxIndex;
        }
        updateTeachersCarousel();
    }

    let teacherTimer = setInterval(nextTeacherSlide, 3200);
    let teacherZoomTimeout = null;

    // Web Audio API से स्मूथ Zoom-In / Zoom-Out साउंड इफेक्ट
    let audioCtx = null;
    function playZoomSound(type = "in") {
        try {
            if (!audioCtx) {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (!AudioContextClass) return;
                audioCtx = new AudioContextClass();
            }
            if (audioCtx.state === "suspended") {
                audioCtx.resume();
            }

            const now = audioCtx.currentTime;

            // 1. Smooth Whoosh Sweep Oscillator
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = "sine";

            if (type === "in") {
                osc.frequency.setValueAtTime(190, now);
                osc.frequency.exponentialRampToValueAtTime(580, now + 0.22);
                gain.gain.setValueAtTime(0.01, now);
                gain.gain.linearRampToValueAtTime(0.22, now + 0.06);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
            } else {
                osc.frequency.setValueAtTime(480, now);
                osc.frequency.exponentialRampToValueAtTime(170, now + 0.22);
                gain.gain.setValueAtTime(0.01, now);
                gain.gain.linearRampToValueAtTime(0.14, now + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
            }

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.3);
        } catch (err) {
            // Ignore audio errors if blocked by browser policy
        }
    }

    function resetTeacherTimer() {
        clearInterval(teacherTimer);
        teacherTimer = setInterval(nextTeacherSlide, 3200);
    }

    // टीचर कार्ड पर क्लिक करने पर स्लाइड रुके, ज़ूम साउंड बजे, कार्ड और उसका डेटा ज़ूम होकर बड़े अक्षरों में दिखे,
    // और 2.5 - 3 सेकंड बाद अपने-आप ज़ूम आउट होकर स्लाइड फिर से चलने लगे
    teacherCards.forEach((card) => {
        card.addEventListener("click", () => {
            playZoomSound("in");
            clearInterval(teacherTimer);
            if (teacherZoomTimeout) {
                clearTimeout(teacherZoomTimeout);
            }

            teacherCards.forEach((c) => c.classList.remove("zoomed-active"));
            card.classList.add("zoomed-active");

            teacherZoomTimeout = setTimeout(() => {
                card.classList.remove("zoomed-active");
                card.classList.remove("active-selected");
                playZoomSound("out");
                resetTeacherTimer();
            }, 2800);
        });
    });

    if (teacherNext) {
        teacherNext.addEventListener("click", () => {
            teacherCards.forEach((c) => c.classList.remove("zoomed-active"));
            nextTeacherSlide();
            resetTeacherTimer();
        });
    }

    if (teacherPrev) {
        teacherPrev.addEventListener("click", () => {
            teacherCards.forEach((c) => c.classList.remove("zoomed-active"));
            prevTeacherSlide();
            resetTeacherTimer();
        });
    }

    window.addEventListener("resize", updateTeachersCarousel);

    // 5. Reviews Section: Smooth Auto-Slide + Mouse Cursor Drag & Wheel Slide
    const reviewsViewport = document.querySelector(".reviews-viewport");
    const reviewsTrack = document.getElementById("reviewsTrack");

    if (reviewsViewport && reviewsTrack) {
        // कार्ड्स को डुप्लीकेट करें ताकि इनफाइनाइट लूप स्मूथ चले
        reviewsTrack.innerHTML += reviewsTrack.innerHTML;

        let isDragging = false;
        let isHovered = false;
        let isReviewZoomPaused = false;
        let reviewZoomTimeout = null;
        let startX = 0;
        let scrollStart = 0;
        let dragMoved = false;
        let autoScrollPos = 0;
        const autoSpeed = 0.7; // धीरे-धीरे स्मूथ ऑटो-स्लाइड स्पीड

        function wrapScroll() {
            const halfWidth = reviewsTrack.scrollWidth / 2;
            if (halfWidth <= 0) return;
            if (reviewsViewport.scrollLeft >= halfWidth) {
                reviewsViewport.scrollLeft -= halfWidth;
                autoScrollPos = reviewsViewport.scrollLeft;
            } else if (reviewsViewport.scrollLeft <= 0) {
                reviewsViewport.scrollLeft += halfWidth;
                autoScrollPos = reviewsViewport.scrollLeft;
            }
        }

        function animateReviews() {
            if (!isDragging && !isHovered && !isReviewZoomPaused) {
                autoScrollPos += autoSpeed;
                reviewsViewport.scrollLeft = autoScrollPos;
                wrapScroll();
            } else {
                autoScrollPos = reviewsViewport.scrollLeft;
            }
            requestAnimationFrame(animateReviews);
        }

        requestAnimationFrame(animateReviews);

        // रिव्यू कार्ड पर क्लिक करने पर स्लाइड रुके, ज़ूम साउंड बजे, कार्ड और उसका डेटा स्मूथ ज़ूम होकर बड़े अक्षरों में दिखे,
        // और 2.5 - 3 सेकंड बाद अपने-आप ज़ूम आउट होकर स्लाइड फिर से चलने लगे
        const allReviewCards = reviewsTrack.querySelectorAll(".review-card");
        allReviewCards.forEach((card) => {
            card.addEventListener("click", () => {
                if (dragMoved) return;
                playZoomSound("in");
                isReviewZoomPaused = true;
                if (reviewZoomTimeout) {
                    clearTimeout(reviewZoomTimeout);
                }

                allReviewCards.forEach((c) => c.classList.remove("zoomed-active"));
                card.classList.add("zoomed-active");

                reviewZoomTimeout = setTimeout(() => {
                    card.classList.remove("zoomed-active");
                    card.classList.remove("active-selected");
                    playZoomSound("out");
                    isReviewZoomPaused = false;
                    isHovered = false;
                }, 2800);
            });
        });

        // माउस कर्सर से पकड़कर स्लाइड करना (Mouse Cursor Drag)
        reviewsViewport.addEventListener("mousedown", (e) => {
            isDragging = true;
            dragMoved = false;
            reviewsViewport.classList.add("dragging");
            startX = e.pageX - reviewsViewport.offsetLeft;
            scrollStart = reviewsViewport.scrollLeft;
        });

        window.addEventListener("mouseup", () => {
            if (isDragging) {
                isDragging = false;
                reviewsViewport.classList.remove("dragging");
                autoScrollPos = reviewsViewport.scrollLeft;
            }
        });

        reviewsViewport.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - reviewsViewport.offsetLeft;
            const walk = (x - startX) * 1.4;
            if (Math.abs(walk) > 6) {
                dragMoved = true;
            }
            reviewsViewport.scrollLeft = scrollStart - walk;
            wrapScroll();
        });

        reviewsViewport.addEventListener("mouseenter", () => {
            isHovered = true;
        });

        reviewsViewport.addEventListener("mouseleave", () => {
            isHovered = false;
            isDragging = false;
            reviewsViewport.classList.remove("dragging");
        });

        // माउस व्हील / टचपैड से भी कर्सर पर स्लाइड हो सके
        reviewsViewport.addEventListener("wheel", (e) => {
            if (Math.abs(e.deltaX) > 0 || Math.abs(e.deltaY) > 0) {
                e.preventDefault();
                reviewsViewport.scrollLeft += e.deltaY !== 0 ? e.deltaY : e.deltaX;
                autoScrollPos = reviewsViewport.scrollLeft;
                wrapScroll();
            }
        }, { passive: false });
    }

    // 6. Contact Form Submit Alert
    const contactForm = document.querySelector(".contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            alert("धन्यवाद! आपका संदेश Sankat Mochan Group of Institution को भेज दिया गया है।");
            contactForm.reset();
        });
    }

    // 7. Classic Interactive Click / Tap Effect on All Elements (Desktop + Mobile)
    const clickableSelectors = [
        ".logo-icon",
        ".nav-links li a",
        ".search-btn",
        ".explore-btn",
        ".f-card",
        ".f-arrow",
        ".teacher-card",
        ".t-arrow",
        ".slider-btn",
        ".review-card",
        ".contact-heading",
        ".contact-details p",
        ".send-btn",
        ".dock-btn",
        ".copyright",
        ".m-logo-wrap",
        ".m-menu-btn",
        ".m-drawer a",
        ".m-scroll-indicator",
        ".m-ach-left",
        ".m-ach-item",
        ".m-action-card",
        ".m-notice-box",
        ".m-notice-row",
        ".m-view-all-btn",
        ".m-review-pill",
        ".m-outline-pill",
        ".m-t-card",
        ".m-blue-pill",
        ".m-student-card",
        ".m-rev-nav button",
        ".m-nav-item",
        ".m-call-circle"
    ];

    const allClickables = document.querySelectorAll(clickableSelectors.join(", "));

    allClickables.forEach((el) => {
        el.addEventListener("click", function (e) {
            // 1. Classic Tap Ripple Wave
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const ripple = document.createElement("span");
            ripple.classList.add("click-ripple");
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 550);

            // 2. Classic Button/Card Press Bounce
            this.classList.remove("click-pulse");
            void this.offsetWidth;
            this.classList.add("click-pulse");
            setTimeout(() => this.classList.remove("click-pulse"), 380);
        });
    });

    // Bottom Dock Buttons Active State Toggle
    const dockBtns = document.querySelectorAll(".dock-btn");
    dockBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            dockBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });

    // Cards Active Selected State Toggle (.f-card, .teacher-card, .review-card)
    function attachGroupActiveState(selector) {
        const items = document.querySelectorAll(selector);
        items.forEach((item) => {
            item.addEventListener("click", () => {
                items.forEach((i) => i.classList.remove("active-selected"));
                item.classList.add("active-selected");
            });
        });
    }

    attachGroupActiveState(".f-card");
    attachGroupActiveState(".teacher-card");
    attachGroupActiveState(".review-card");

    // 8. Mobile Phone View Interactions (max-width: 768px)
    const mMenuBtn = document.getElementById("mMenuBtn");
    const mMoreBtn = document.getElementById("mMoreBtn");
    const mDrawer = document.getElementById("mDrawer");

    if (mMenuBtn && mDrawer) {
        mMenuBtn.addEventListener("click", () => {
            mDrawer.classList.toggle("open");
        });
    }
    if (mMoreBtn && mDrawer) {
        mMoreBtn.addEventListener("click", (e) => {
            e.preventDefault();
            mDrawer.classList.toggle("open");
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // Mobile Achievers: Manual Touch/Drag/Wheel Scroll + Auto-Resume 1 Second After Scrolling
    const mAchRight = document.querySelector(".m-ach-right");
    const mAchTrack = document.getElementById("mAchTrack");
    if (mAchRight && mAchTrack) {
        mAchTrack.innerHTML += mAchTrack.innerHTML;

        let achPaused = false;
        let achDragging = false;
        let achStartX = 0;
        let achScrollStart = 0;
        let achAutoPos = 0;
        let achResumeTimer = null;
        const achSpeed = 0.55;

        function wrapAchScroll() {
            const halfWidth = mAchTrack.scrollWidth / 2;
            if (halfWidth <= 0) return;
            if (mAchRight.scrollLeft >= halfWidth) {
                mAchRight.scrollLeft -= halfWidth;
                achAutoPos = mAchRight.scrollLeft;
            } else if (mAchRight.scrollLeft <= 0) {
                mAchRight.scrollLeft += halfWidth;
                achAutoPos = mAchRight.scrollLeft;
            }
        }

        function pauseAchAndResumeAfter1Sec() {
            achPaused = true;
            if (achResumeTimer) clearTimeout(achResumeTimer);
            achResumeTimer = setTimeout(() => {
                if (!achDragging) {
                    achAutoPos = mAchRight.scrollLeft;
                    achPaused = false;
                }
            }, 1000); // 1 सेकंड बाद फिर से ऑटो-स्क्रॉल शुरू
        }

        function animateAchievers() {
            if (!achPaused && !achDragging) {
                achAutoPos += achSpeed;
                mAchRight.scrollLeft = achAutoPos;
                wrapAchScroll();
            } else {
                achAutoPos = mAchRight.scrollLeft;
            }
            requestAnimationFrame(animateAchievers);
        }

        requestAnimationFrame(animateAchievers);

        // Touch Scroll (Mobile Finger Swipe)
        mAchRight.addEventListener("touchstart", () => {
            achDragging = true;
            achPaused = true;
            if (achResumeTimer) clearTimeout(achResumeTimer);
        }, { passive: true });

        mAchRight.addEventListener("touchmove", () => {
            wrapAchScroll();
        }, { passive: true });

        mAchRight.addEventListener("touchend", () => {
            achDragging = false;
            pauseAchAndResumeAfter1Sec();
        });

        // Mouse Drag Scroll
        mAchRight.addEventListener("mousedown", (e) => {
            achDragging = true;
            achPaused = true;
            if (achResumeTimer) clearTimeout(achResumeTimer);
            mAchRight.classList.add("dragging");
            achStartX = e.pageX - mAchRight.offsetLeft;
            achScrollStart = mAchRight.scrollLeft;
        });

        window.addEventListener("mouseup", () => {
            if (achDragging) {
                achDragging = false;
                mAchRight.classList.remove("dragging");
                pauseAchAndResumeAfter1Sec();
            }
        });

        mAchRight.addEventListener("mousemove", (e) => {
            if (!achDragging) return;
            e.preventDefault();
            const x = e.pageX - mAchRight.offsetLeft;
            const walk = (x - achStartX) * 1.3;
            mAchRight.scrollLeft = achScrollStart - walk;
            wrapAchScroll();
        });

        // Wheel / Touchpad Scroll
        mAchRight.addEventListener("wheel", (e) => {
            e.preventDefault();
            mAchRight.scrollLeft += e.deltaY !== 0 ? e.deltaY : e.deltaX;
            wrapAchScroll();
            pauseAchAndResumeAfter1Sec();
        }, { passive: false });
    }

    // Mobile Hero Video: Auto-play once without music/sound, sync graph duration with video duration, then lock
    const mHeroVideo = document.getElementById("mHeroVideo");

    if (mHeroVideo) {
        setupReliableHeroVideo(mHeroVideo);

        function syncGraphDuration() {
            if (mHeroVideo.duration && isFinite(mHeroVideo.duration)) {
                const durStr = `${mHeroVideo.duration}s`;
                const graph = document.getElementById("mGrowthGraph");
                if (graph) graph.style.setProperty("--graph-dur", durStr);
                const mHeroSec = document.querySelector(".m-hero");
                if (mHeroSec) mHeroSec.style.setProperty("--graph-dur", durStr);
            }
        }

        if (mHeroVideo.readyState >= 1) {
            syncGraphDuration();
        } else {
            mHeroVideo.addEventListener("loadedmetadata", syncGraphDuration);
        }

        // Recap Button: Replay Hero Video & Graph Animation together
        const mRecallBtn = document.getElementById("mRecallBtn");
        if (mRecallBtn) {
            mRecallBtn.addEventListener("click", () => {
                if (mHeroVideo._resetHeroState) mHeroVideo._resetHeroState();
                mHeroVideo.currentTime = 0;
                mHeroVideo.muted = true;
                mHeroVideo.play().catch(() => {});
                const currentGraph = document.getElementById("mGrowthGraph");
                if (currentGraph && currentGraph.parentNode) {
                    const clone = currentGraph.cloneNode(true);
                    currentGraph.parentNode.replaceChild(clone, currentGraph);
                }
            });
        }
    }

    // Mobile Scroll Down Button: Scroll all the way to the bottom on tap/click
    const mScrollIndicator = document.querySelector(".m-scroll-indicator");
    if (mScrollIndicator) {
        mScrollIndicator.addEventListener("click", () => {
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: "smooth"
            });
        });
    }

    // Mobile Latest Notice Box: 3D Flip Auto-Cycling when compact, Expands on clicking "View Notice"
    const mNoticeBox = document.getElementById("mNotices");
    const mViewNoticeBtn = document.getElementById("mViewNoticeBtn");
    if (mNoticeBox) {
        const noticeRows = Array.from(mNoticeBox.querySelectorAll(".m-notice-row"));
        let currentNoticeIdx = 0;

        if (noticeRows.length > 0) {
            noticeRows[0].classList.add("notice-active");

            setInterval(() => {
                if (mNoticeBox.classList.contains("expanded") || noticeRows.length < 2) return;

                const outgoing = noticeRows[currentNoticeIdx];
                currentNoticeIdx = (currentNoticeIdx + 1) % noticeRows.length;
                const incoming = noticeRows[currentNoticeIdx];

                outgoing.classList.remove("notice-active", "notice-flip-in");
                outgoing.classList.add("notice-flip-out");

                incoming.classList.remove("notice-flip-out");
                void incoming.offsetWidth;
                incoming.classList.add("notice-active", "notice-flip-in");

                setTimeout(() => {
                    outgoing.classList.remove("notice-flip-out");
                    incoming.classList.remove("notice-flip-in");
                }, 620);
            }, 4000);
        }

        if (mViewNoticeBtn) {
            mViewNoticeBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const isExpanded = mNoticeBox.classList.toggle("expanded");
                noticeRows.forEach((row) => row.classList.remove("notice-flip-in", "notice-flip-out"));
                if (!isExpanded && noticeRows[currentNoticeIdx]) {
                    noticeRows.forEach((row) => row.classList.remove("notice-active"));
                    noticeRows[currentNoticeIdx].classList.add("notice-active");
                }
                if (isExpanded) {
                    playZoomSound("in");
                    mViewNoticeBtn.innerHTML = 'Close <i class="fa-solid fa-chevron-up"></i>';
                } else {
                    playZoomSound("out");
                    mViewNoticeBtn.innerHTML = 'View Notice <i class="fa-solid fa-arrow-right"></i>';
                }
            });
        }
    }

    // Mobile Teacher Cards: 4 Cards Per Frame + Stepped Spotlight Showcase Glide (Distinct from Our Achievers) + Manual Scroll + Click Zoom & Sound
    const mTeachersViewport = document.getElementById("mTeachersViewport");
    const mTeachersTrack = document.getElementById("mTeachersTrack");
    let mTeacherZoomTimer = null;

    if (mTeachersViewport && mTeachersTrack) {
        const originalTeacherCount = mTeachersTrack.children.length;
        mTeachersTrack.innerHTML += mTeachersTrack.innerHTML;

        let mtPaused = false;
        let mtDragging = false;
        let mtZoomPaused = false;
        let mtStartX = 0;
        let mtScrollStart = 0;
        let mtResumeTimer = null;
        let mtStepIndex = 0;

        const mTeacherCards = Array.from(mTeachersTrack.querySelectorAll(".m-t-card"));

        function getTeacherCardStepWidth() {
            const firstCard = mTeacherCards[0];
            return firstCard ? firstCard.offsetWidth + 5 : 74;
        }

        function updateTeacherSpotlight(activeIdx) {
            mTeacherCards.forEach((c) => c.classList.remove("t-spotlight"));
            const target = mTeacherCards[activeIdx % mTeacherCards.length];
            if (target) target.classList.add("t-spotlight");
        }

        function wrapMtScroll() {
            const halfWidth = mTeachersTrack.scrollWidth / 2;
            if (halfWidth <= 0) return;
            if (mTeachersViewport.scrollLeft >= halfWidth) {
                mTeachersViewport.scrollLeft -= halfWidth;
            } else if (mTeachersViewport.scrollLeft <= 0) {
                mTeachersViewport.scrollLeft += halfWidth;
            }
        }

        function pauseMtAndResumeAfter1Sec() {
            mtPaused = true;
            if (mtResumeTimer) clearTimeout(mtResumeTimer);
            mtResumeTimer = setTimeout(() => {
                if (!mtDragging && !mtZoomPaused) {
                    const stepW = getTeacherCardStepWidth();
                    mtStepIndex = Math.round(mTeachersViewport.scrollLeft / stepW) % originalTeacherCount;
                    mtPaused = false;
                }
            }, 1400);
        }

        // Initial spotlight on exact center card (3rd of 5 visible cards)
        updateTeacherSpotlight(2);

        // Stepped Card-by-Card Glide + Center Spotlight Showcase every 2.4s
        setInterval(() => {
            if (mtPaused || mtDragging || mtZoomPaused) return;

            const stepW = getTeacherCardStepWidth();
            mtStepIndex++;

            if (mtStepIndex > originalTeacherCount) {
                mtStepIndex = 1;
                mTeachersViewport.scrollLeft = 0;
            }

            const targetScroll = mtStepIndex * stepW;
            mTeachersViewport.scrollTo({
                left: targetScroll,
                behavior: "smooth"
            });

            // Highlight exact center card (index + 2 out of 5 visible cards)
            updateTeacherSpotlight(mtStepIndex + 2);
        }, 2400);

        mTeachersViewport.addEventListener("touchstart", () => {
            mtDragging = true;
            mtPaused = true;
            if (mtResumeTimer) clearTimeout(mtResumeTimer);
        }, { passive: true });

        mTeachersViewport.addEventListener("touchmove", () => {
            wrapMtScroll();
        }, { passive: true });

        mTeachersViewport.addEventListener("touchend", () => {
            mtDragging = false;
            pauseMtAndResumeAfter1Sec();
        });

        mTeachersViewport.addEventListener("mousedown", (e) => {
            mtDragging = true;
            mtPaused = true;
            if (mtResumeTimer) clearTimeout(mtResumeTimer);
            mtStartX = e.pageX - mTeachersViewport.offsetLeft;
            mtScrollStart = mTeachersViewport.scrollLeft;
        });

        window.addEventListener("mouseup", () => {
            if (mtDragging) {
                mtDragging = false;
                pauseMtAndResumeAfter1Sec();
            }
        });

        mTeachersViewport.addEventListener("mousemove", (e) => {
            if (!mtDragging) return;
            e.preventDefault();
            const x = e.pageX - mTeachersViewport.offsetLeft;
            const walk = (x - mtStartX) * 1.3;
            mTeachersViewport.scrollLeft = mtScrollStart - walk;
            wrapMtScroll();
        });

        mTeachersViewport.addEventListener("wheel", (e) => {
            e.preventDefault();
            mTeachersViewport.scrollLeft += e.deltaY !== 0 ? e.deltaY : e.deltaX;
            wrapMtScroll();
            pauseMtAndResumeAfter1Sec();
        }, { passive: false });

        mTeacherCards.forEach((card) => {
            card.addEventListener("click", () => {
                playZoomSound("in");
                mtZoomPaused = true;
                if (mTeacherZoomTimer) clearTimeout(mTeacherZoomTimer);
                mTeacherCards.forEach((c) => c.classList.remove("zoomed-active", "t-spotlight"));
                card.classList.add("zoomed-active");
                mTeacherZoomTimer = setTimeout(() => {
                    card.classList.remove("zoomed-active");
                    playZoomSound("out");
                    mtZoomPaused = false;
                    mtPaused = false;
                }, 2800);
            });
        });
    }

    // View All Teachers: Section-wise All Teachers Expand/Collapse + Click Zoom on each teacher card
    const mViewAllTeachersBtn = document.getElementById("mViewAllTeachersBtn");
    const mAllTeachersList = document.getElementById("mAllTeachersList");
    if (mViewAllTeachersBtn && mAllTeachersList) {
        mViewAllTeachersBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = mAllTeachersList.classList.toggle("open");
            if (isOpen) {
                playZoomSound("in");
                mViewAllTeachersBtn.innerHTML = 'Hide Teachers <i class="fa-solid fa-chevron-up"></i>';
            } else {
                playZoomSound("out");
                mViewAllTeachersBtn.innerHTML = 'View All Teachers <i class="fa-solid fa-arrow-right"></i>';
            }
        });

        const miniTeacherCards = mAllTeachersList.querySelectorAll(".m-teacher-mini-card");
        let miniTeacherZoomTimer = null;
        miniTeacherCards.forEach((card) => {
            card.addEventListener("click", () => {
                if (card.classList.contains("zoomed-active")) {
                    if (miniTeacherZoomTimer) clearTimeout(miniTeacherZoomTimer);
                    card.classList.remove("zoomed-active");
                    playZoomSound("out");
                    return;
                }
                miniTeacherCards.forEach((c) => c.classList.remove("zoomed-active"));
                playZoomSound("in");
                card.classList.add("zoomed-active");
                if (miniTeacherZoomTimer) clearTimeout(miniTeacherZoomTimer);
                miniTeacherZoomTimer = setTimeout(() => {
                    card.classList.remove("zoomed-active");
                    playZoomSound("out");
                }, 3200);
            });
        });
    }

    // Mobile Student Reviews Fade-Slide Auto Carousel
    const mobileReviews = [
        {
            name: "Rohit Kumar",
            img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=160&q=80",
            text: "“Best school ever! Great teachers and amazing facilities at Sankat Mochan.”"
        },
        {
            name: "Sneha Mishra",
            img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80",
            text: "“Sankat Mochan Group of Institution gave me top academic guidance and confidence!”"
        },
        {
            name: "Aman Dubey",
            img: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=160&q=80",
            text: "“Smart classrooms, science labs, and supportive faculty make learning awesome!”"
        },
        {
            name: "Priya Tiwari",
            img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=160&q=80",
            text: "“Discipline, moral values, and board exam preparation here are truly unmatched.”"
        },
        {
            name: "Aarav Sharma",
            img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80",
            text: "“Every teacher guides us personally so every student excels with confidence.”"
        }
    ];
    let mRevIdx = 0;
    let mRevAnimating = false;
    let mRevAutoTimer = null;
    const mStudentCard = document.querySelector(".m-student-card");
    const mRevImg = document.getElementById("mRevImg");
    const mRevName = document.getElementById("mRevName");
    const mRevText = document.getElementById("mRevText");
    const mRevPrev = document.getElementById("mRevPrev");
    const mRevNext = document.getElementById("mRevNext");

    function switchMobileReview(direction = "next") {
        if (!mRevName || !mRevText || !mRevImg || !mStudentCard || mRevAnimating) return;
        mRevAnimating = true;

        const outClass = direction === "prev" ? "rev-fade-out-prev" : "rev-fade-out-next";
        const inClass = direction === "prev" ? "rev-fade-in-prev" : "rev-fade-in-next";

        mStudentCard.classList.remove("rev-fade-in-next", "rev-fade-in-prev", "rev-fade-out-next", "rev-fade-out-prev");
        mStudentCard.classList.add(outClass);

        setTimeout(() => {
            if (direction === "prev") {
                mRevIdx = (mRevIdx - 1 + mobileReviews.length) % mobileReviews.length;
            } else {
                mRevIdx = (mRevIdx + 1) % mobileReviews.length;
            }

            const item = mobileReviews[mRevIdx];
            mRevName.textContent = item.name;
            mRevImg.src = item.img;
            mRevImg.alt = item.name;
            mRevText.textContent = item.text;

            mStudentCard.classList.remove(outClass);
            void mStudentCard.offsetWidth;
            mStudentCard.classList.add(inClass);

            setTimeout(() => {
                mStudentCard.classList.remove(inClass);
                mRevAnimating = false;
            }, 560);
        }, 320);
    }

    function startMobileReviewAutoSlide() {
        if (mRevAutoTimer) clearInterval(mRevAutoTimer);
        mRevAutoTimer = setInterval(() => {
            if (mStudentCard && !mStudentCard.classList.contains("zoomed-active")) {
                switchMobileReview("next");
            }
        }, 3800);
    }

    let mRevZoomTimer = null;

    if (mStudentCard) {
        startMobileReviewAutoSlide();

        // रिव्यू कार्ड पर क्लिक करने पर हल्का ज़ूम होकर सामने दिखे (और पढ़ने के लिए ऑटो-स्लाइड रुक जाए)
        mStudentCard.addEventListener("click", (e) => {
            if (e.target.closest(".m-rev-nav")) return;

            if (mStudentCard.classList.contains("zoomed-active")) {
                if (mRevZoomTimer) clearTimeout(mRevZoomTimer);
                mStudentCard.classList.remove("zoomed-active");
                playZoomSound("out");
                return;
            }

            playZoomSound("in");
            mStudentCard.classList.add("zoomed-active");
            if (mRevZoomTimer) clearTimeout(mRevZoomTimer);
            mRevZoomTimer = setTimeout(() => {
                mStudentCard.classList.remove("zoomed-active");
                playZoomSound("out");
            }, 3200);
        });
    }

    if (mRevNext) {
        mRevNext.addEventListener("click", (e) => {
            e.stopPropagation();
            switchMobileReview("next");
            startMobileReviewAutoSlide();
        });
    }

    if (mRevPrev) {
        mRevPrev.addEventListener("click", (e) => {
            e.stopPropagation();
            switchMobileReview("prev");
            startMobileReviewAutoSlide();
        });
    }

    // View More Reviews: Section-wise All Reviews Expand/Collapse + Click Zoom on each review card
    const mViewMoreRevBtn = document.getElementById("mViewMoreRevBtn");
    const mAllReviewsList = document.getElementById("mAllReviewsList");
    if (mViewMoreRevBtn && mAllReviewsList) {
        mViewMoreRevBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = mAllReviewsList.classList.toggle("open");
            if (isOpen) {
                playZoomSound("in");
                mViewMoreRevBtn.innerHTML = 'Hide Reviews <i class="fa-solid fa-chevron-up"></i>';
            } else {
                playZoomSound("out");
                mViewMoreRevBtn.innerHTML = 'View More Reviews <i class="fa-solid fa-arrow-right"></i>';
            }
        });

        const miniReviewCards = mAllReviewsList.querySelectorAll(".m-rev-mini-card");
        let miniRevZoomTimer = null;
        miniReviewCards.forEach((card) => {
            card.addEventListener("click", () => {
                if (card.classList.contains("zoomed-active")) {
                    if (miniRevZoomTimer) clearTimeout(miniRevZoomTimer);
                    card.classList.remove("zoomed-active");
                    playZoomSound("out");
                    return;
                }
                miniReviewCards.forEach((c) => c.classList.remove("zoomed-active"));
                playZoomSound("in");
                card.classList.add("zoomed-active");
                if (miniRevZoomTimer) clearTimeout(miniRevZoomTimer);
                miniRevZoomTimer = setTimeout(() => {
                    card.classList.remove("zoomed-active");
                    playZoomSound("out");
                }, 3200);
            });
        });
    }

    // Mobile Footer: Developer Button Toggle
    const mDevBtn = document.getElementById("mDevBtn");
    const mDevInfoCard = document.getElementById("mDevInfoCard");
    if (mDevBtn && mDevInfoCard) {
        mDevBtn.addEventListener("click", () => {
            const isOpen = mDevInfoCard.classList.toggle("open");
            playZoomSound(isOpen ? "in" : "out");
        });
    }

    // Mobile Footer: Interactive Star Rating & Send Review Form
    const mStarPicker = document.getElementById("mStarPicker");
    const mReviewForm = document.getElementById("mReviewForm");
    const mRevInputName = document.getElementById("mRevInputName");
    const mRevInputMsg = document.getElementById("mRevInputMsg");
    const mRevStatus = document.getElementById("mRevStatus");
    let selectedStarRating = 5;

    if (mStarPicker) {
        const stars = mStarPicker.querySelectorAll("i");
        stars.forEach((star) => {
            star.addEventListener("click", () => {
                selectedStarRating = parseInt(star.dataset.val, 10) || 5;
                stars.forEach((s) => {
                    const v = parseInt(s.dataset.val, 10);
                    s.classList.toggle("active", v <= selectedStarRating);
                });
            });
        });
    }

    if (mReviewForm) {
        mReviewForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const nameVal = mRevInputName ? mRevInputName.value.trim() : "";
            const msgVal = mRevInputMsg ? mRevInputMsg.value.trim() : "";
            if (!nameVal || !msgVal) return;

            mobileReviews.unshift({
                name: nameVal,
                img: "logo.jpg",
                text: `“${msgVal}”`
            });
            mRevIdx = 0;
            if (mRevName && mRevText && mRevImg) {
                mRevName.textContent = nameVal;
                mRevImg.src = "logo.jpg";
                mRevImg.alt = nameVal;
                mRevText.textContent = `“${msgVal}”`;
            }

            playZoomSound("in");
            if (mRevStatus) {
                mRevStatus.textContent = "Thank you! Your review has been sent.";
                setTimeout(() => {
                    mRevStatus.textContent = "";
                }, 4000);
            }
            mReviewForm.reset();
        });
    }

    // Mobile Bottom Nav Active Item
    const mNavItems = document.querySelectorAll(".m-bottom-nav .m-nav-item");
    mNavItems.forEach((item) => {
        item.addEventListener("click", () => {
            mNavItems.forEach((n) => n.classList.remove("active"));
            item.classList.add("active");
        });
    });

    // Global Active Press Effect on all interactive buttons, cards, links & nav items
    const pressSelector = [
        "button",
        "a",
        ".f-card",
        ".teacher-card",
        ".review-card",
        ".m-action-card",
        ".m-t-card",
        ".m-teacher-mini-card",
        ".m-student-card",
        ".m-rev-mini-card",
        ".m-notice-box",
        ".m-ach-item",
        ".m-contact-chip",
        ".m-nav-item",
        ".m-call-circle",
        ".dock-btn"
    ].join(", ");

    let activePressedEl = null;

    function releaseActivePress() {
        if (activePressedEl) {
            activePressedEl.classList.remove("is-active-press");
            activePressedEl = null;
        }
    }

    document.addEventListener("pointerdown", (e) => {
        const target = e.target.closest(pressSelector);
        if (!target) return;
        releaseActivePress();
        activePressedEl = target;
        target.classList.add("is-active-press");
    });

    window.addEventListener("pointerup", releaseActivePress);
    window.addEventListener("pointercancel", releaseActivePress);
    window.addEventListener("blur", releaseActivePress);
});
