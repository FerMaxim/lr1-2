document.addEventListener('DOMContentLoaded', () => {
    const paymentOptionsContainer = document.querySelector('.payment-options');
    let originalPaymentCardsOrder = [];

    if (paymentOptionsContainer) {
        originalPaymentCardsOrder = Array.from(paymentOptionsContainer.querySelectorAll('.payment-card')).slice(0, 3);
    }
    window.dataLoadedFromStorage = false;

    if (!window.dataLoadedFromStorage) {
        loadPaymentsFromStorage();
        loadZonesFromStorage();
        window.dataLoadedFromStorage = true;
    }

    reorganizeCards();
    window.addEventListener('resize', reorganizeCards);
    window.addEventListener('load', () => {
        reorganizeCards();
    });
});

document.addEventListener('DOMContentLoaded', () => {
    initPaymentForm();
    initZoneForm();
    document.getElementById('reset-payments-btn').addEventListener('click', resetPayments);
    document.getElementById('reset-zones-btn').addEventListener('click', resetZones);
    window.addEventListener('resize', () => {
        reorganizeCards();
    });
});

function reorganizeCards() {
    const isTablet = window.matchMedia('(min-width: 760px) and (max-width: 1200px)').matches;
    const isMobile = window.matchMedia('(max-width: 759px)').matches;
    const isDesktop = !isTablet && !isMobile;
    const paymentOptionsContainer = document.querySelector('.payment-options');
    const zoneCards = document.querySelectorAll('.zone-card');
    if (!paymentOptionsContainer) return;
    const currentIsTablet = paymentOptionsContainer.getAttribute('data-view') === 'tablet';
    const currentIsMobile = paymentOptionsContainer.getAttribute('data-view') === 'mobile';
    const currentIsDesktop = !currentIsTablet && !currentIsMobile;

    if ((currentIsTablet || currentIsMobile) && isDesktop) {
        location.reload();
        return;
    }

    const allPaymentCards = Array.from(paymentOptionsContainer.querySelectorAll('.payment-card'));

    if (isTablet) {
        if (!currentIsTablet) {
            paymentOptionsContainer.setAttribute('data-view', 'tablet');
            const paymentCards = paymentOptionsContainer.querySelectorAll('.payment-card');
            const cardsWithoutOptionImages = [];
            const cardsWithOptionImages = [];
            paymentCards.forEach(card => {
                restoreOriginalCardStructure(card);
                const optionImages = card.querySelector('.option-images');
                if (optionImages) {
                    cardsWithOptionImages.push(card);
                } else {
                    cardsWithoutOptionImages.push(card);
                }
                if (isTablet) {
                    card.style.width = '36.66vw';
                }
            });
            paymentOptionsContainer.innerHTML = '';
            cardsWithoutOptionImages.forEach((card, index) => {
                if (isTablet && index === cardsWithoutOptionImages.length - 1 && cardsWithoutOptionImages.length % 2 !== 0) {
                    card.style.width = '100%';
                }

                paymentOptionsContainer.appendChild(card);
            });
            cardsWithOptionImages.forEach(card => {
                if (isTablet) {
                    card.style.width = '100%';
                }
                if (isTablet) {
                    const optionImages = card.querySelector('.option-images');
                    const paymentIcon = card.querySelector('.payment-icon');
                    if (optionImages && !card.querySelector('.optional-images-container')) {
                        const optionalImagesContainer = document.createElement('div');
                        optionalImagesContainer.className = 'optional-images-container';
                        optionalImagesContainer.style.display = 'flex';
                        optionalImagesContainer.style.flexDirection = 'row';
                        optionalImagesContainer.style.justifyContent = 'space-between';
                        optionalImagesContainer.style.alignItems = 'center';
                        optionalImagesContainer.style.width = '100%';
                        const optionImagesClone = optionImages.cloneNode(true);
                        const paymentIconClone = paymentIcon.cloneNode(true);
                        optionImages.remove();
                        paymentIcon.remove();
                        optionalImagesContainer.appendChild(optionImagesClone);
                        optionalImagesContainer.appendChild(paymentIconClone);
                        card.appendChild(optionalImagesContainer);
                        paymentIconClone.style.position = 'static';
                    }
                }
                paymentOptionsContainer.appendChild(card);
            });
            if (isTablet) {
                adaptLastCard(zoneCards);
                zoneCards.forEach(card => {
                    const titleElement = card.querySelector('.zone-title');
                    if (titleElement) {
                        const titleText = titleElement.textContent;
                        const match = titleText.match(/Тарифная зона (\d+) - ([\d\s]+₽)/);
                        if (match) {
                            titleElement.innerHTML = `Тарифная зона ${match[1]}<br>${match[2]}`;

                            titleElement.setAttribute('data-original-text', titleText);
                        }
                    }
                });
            }
        }
    } else if (isMobile) {
        if (!currentIsMobile) {
            paymentOptionsContainer.setAttribute('data-view', 'mobile');
            const paymentCards = paymentOptionsContainer.querySelectorAll('.payment-card');
            const cardsWithoutOptionImages = [];
            const cardsWithOptionImages = [];
            paymentCards.forEach(card => {
                restoreOriginalCardStructure(card);
                const optionImages = card.querySelector('.option-images');
                if (optionImages) {
                    cardsWithOptionImages.push(card);
                } else {
                    cardsWithoutOptionImages.push(card);
                }
                card.style.width = ''; 
            });

            paymentOptionsContainer.innerHTML = '';
            cardsWithoutOptionImages.forEach(card => {
                paymentOptionsContainer.appendChild(card);
            });
            cardsWithOptionImages.forEach(card => {
                paymentOptionsContainer.appendChild(card);
            });
            zoneCards.forEach(card => {
                card.style.width = ''; 
            });

            zoneCards.forEach(card => {
                const titleElement = card.querySelector('.zone-title');
                if (titleElement && titleElement.hasAttribute('data-original-text')) {
                    titleElement.textContent = titleElement.getAttribute('data-original-text');
                }
            });
        }
    } else {

        if (!currentIsDesktop) {
            const cardsFromLocalStorage = JSON.parse(localStorage.getItem('payments')) || [];
            const zonesFromLocalStorage = JSON.parse(localStorage.getItem('zones')) || [];
            paymentOptionsContainer.setAttribute('data-view', 'desktop');
            paymentOptionsContainer.innerHTML = '';
            originalPaymentCardsOrder.forEach(card => {
                restoreOriginalCardStructure(card);
                card.style.width = '26.47%';
                paymentOptionsContainer.appendChild(card);
            });

            cardsFromLocalStorage.forEach(paymentData => {
                addPaymentCardWithoutReload(paymentData);
            });
            const zonesContainer = document.querySelector('.zones-container');
            if (zonesContainer) {
                const originalZoneCards = Array.from(document.querySelectorAll('.zone-card')).slice(0, 4);
                zonesContainer.innerHTML = '';
                originalZoneCards.forEach(card => {
                    card.style.width = '17.96%';
                    const titleElement = card.querySelector('.zone-title');
                    if (titleElement && titleElement.hasAttribute('data-original-text')) {
                        titleElement.textContent = titleElement.getAttribute('data-original-text');
                    }
                    zonesContainer.appendChild(card);
                });
                zonesFromLocalStorage.forEach(zoneData => {
                    addZoneCardWithoutReload(zoneData);
                });
            }
        }
        applyDesktopLayoutRules();
    }
    if (isTablet) {
        adaptLastCard(zoneCards);
    }
}

function restoreOriginalCardStructure(card) {
    const optionalImagesContainer = card.querySelector('.optional-images-container');
    if (optionalImagesContainer) {
        const optionImages = optionalImagesContainer.querySelector('.option-images');
        const paymentIcon = optionalImagesContainer.querySelector('.payment-icon');
        const paymentInfo = card.querySelector('.payment-info');
        if (optionImages && paymentIcon && paymentInfo) {
            const optionImagesClone = optionImages.cloneNode(true);
            const paymentIconClone = paymentIcon.cloneNode(true);
            paymentInfo.appendChild(optionImagesClone);
            card.appendChild(paymentIconClone);
            optionalImagesContainer.remove();
        }
    }
}

function adaptLastCard(cards) {
    if (cards.length === 0) return;
    if (cards.length % 2 !== 0) {
        cards.forEach(card => {
            card.style.width = '36.66vw'; 
        });
        const lastCard = cards[cards.length - 1];
        lastCard.style.width = '100%'; 
    } else {
        cards.forEach(card => {
            card.style.width = '36.66vw'; 
        });
    }
}

function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
    });
}

function resetPayments() {
    localStorage.removeItem('payments');
    location.reload();
}

function resetZones() {
    localStorage.removeItem('zones');
    location.reload();
}

function initPaymentForm() {
    const addPaymentForm = document.getElementById('add-payment-form');
    const addImageBtn = document.getElementById('add-image-btn');
    const additionalImagesContainer = document.getElementById('additional-images-container');
    addImageBtn.addEventListener('click', () => {
        const imageDiv = document.createElement('div');
        imageDiv.className = 'additional-image';
        imageDiv.innerHTML = `
            <input type="file" class="additional-image-file" accept="image/*">
            <button type="button" class="remove-image">Удалить</button>
        `;
        additionalImagesContainer.appendChild(imageDiv);
        const removeBtn = imageDiv.querySelector('.remove-image');
        removeBtn.addEventListener('click', () => {
            imageDiv.remove();
        });
    });
    addPaymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('payment-title').value;
        const desc = document.getElementById('payment-desc').value;
        const iconFile = document.getElementById('payment-icon').files[0];
        if (!iconFile) {
            alert('Пожалуйста, выберите иконку для способа оплаты');
            return;
        }
        const iconUrl = await fileToDataURL(iconFile);
        const additionalImageFiles = document.querySelectorAll('.additional-image-file');
        const additionalImages = [];

        for (const input of additionalImageFiles) {
            if (input.files.length > 0) {
                const dataUrl = await fileToDataURL(input.files[0]);
                additionalImages.push(dataUrl);
            }
        }

        const paymentData = {
            title,
            desc,
            iconUrl,
            additionalImages: additionalImages.length > 0 ? additionalImages : null
        };

        savePaymentToStorage(paymentData);
        addPaymentCard(paymentData);
        addPaymentForm.reset();
        additionalImagesContainer.innerHTML = '';
        reorganizeCards();
        location.reload();
    });
}

function savePaymentToStorage(paymentData) {
    let payments = JSON.parse(localStorage.getItem('payments')) || [];
    payments.push(paymentData);
    localStorage.setItem('payments', JSON.stringify(payments));
}

function loadPaymentsFromStorage() {
    const payments = JSON.parse(localStorage.getItem('payments')) || [];
    payments.forEach(payment => {
        addPaymentCardWithoutReload(payment);
    });
}

function addPaymentCard(paymentData) {
    const paymentOptionsContainer = document.querySelector('.payment-options');
    if (!paymentOptionsContainer) return;
    const card = document.createElement('div');
    card.className = 'payment-card';
    const infoDiv = document.createElement('div');
    infoDiv.className = 'payment-info';
    const title = document.createElement('h3');
    title.className = 'option-title';
    title.textContent = paymentData.title;
    infoDiv.appendChild(title);
    const desc = document.createElement('p');
    desc.className = 'option-desc';
    desc.textContent = paymentData.desc;
    infoDiv.appendChild(desc);

    if (paymentData.additionalImages && paymentData.additionalImages.length > 0) {
        const optionImages = document.createElement('div');
        optionImages.className = 'option-images';
        paymentData.additionalImages.forEach(imgUrl => {
            const img = document.createElement('img');
            img.src = imgUrl;
            img.alt = 'Payment system';
            img.className = 'option-image';
            optionImages.appendChild(img);
        });
        infoDiv.appendChild(optionImages);
    }

    card.appendChild(infoDiv);

    const icon = document.createElement('img');
    icon.src = paymentData.iconUrl;
    icon.alt = paymentData.title;
    icon.className = 'payment-icon';
    card.appendChild(icon);
    paymentOptionsContainer.appendChild(card);
    updateOriginalPaymentCardsOrder();
    applyDesktopLayoutRules();
}

function updateOriginalPaymentCardsOrder() {
    const paymentOptionsContainer = document.querySelector('.payment-options');
    if (paymentOptionsContainer) {
        originalPaymentCardsOrder = Array.from(paymentOptionsContainer.querySelectorAll('.payment-card'));
    }
}

function initZoneForm() {
    const addZoneForm = document.getElementById('add-zone-form');
    addZoneForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const zoneNumber = document.getElementById('zone-number').value;
        const zonePrice = document.getElementById('zone-price').value;
        const zoneDesc = document.getElementById('zone-desc-input').value;
        const zoneData = {
            number: zoneNumber,
            price: zonePrice,
            desc: zoneDesc
        };
        saveZoneToStorage(zoneData);
    
        addZoneForm.reset();
        
        location.reload();
    });
}

function saveZoneToStorage(zoneData) {
    let zones = JSON.parse(localStorage.getItem('zones')) || [];
    zones.push(zoneData);
    localStorage.setItem('zones', JSON.stringify(zones));
}

function loadZonesFromStorage() {
    const zones = JSON.parse(localStorage.getItem('zones')) || [];
    zones.forEach(zone => {
        addZoneCardWithoutReload(zone);
    });
}

function addZoneCardWithoutReload(zoneData) {
    const zonesContainer = document.querySelector('.zones-container');
    if (!zonesContainer) return;

    const card = document.createElement('div');
    card.className = 'zone-card';
    const title = document.createElement('h3');
    title.className = 'zone-title';
    title.textContent = `Тарифная зона ${zoneData.number} - ${zoneData.price} ₽`;
    title.setAttribute('data-original-text', title.textContent);
    const isTablet = window.matchMedia('(min-width: 760px) and (max-width: 1200px)').matches;
    if (isTablet) {
        title.innerHTML = `Тарифная зона ${zoneData.number}<br>${zoneData.price} ₽`;
    }
    card.appendChild(title);

    const desc = document.createElement('p');
    desc.className = 'zone-desc';
    desc.textContent = zoneData.desc;
    card.appendChild(desc);
    zonesContainer.appendChild(card);
}

function applyDesktopLayoutRules() {
    const isDesktop = window.matchMedia('(min-width: 1201px)').matches;
    if (!isDesktop) return; 
    applyPaymentLayoutRules();
    applyZoneLayoutRules();
}

function applyPaymentLayoutRules() {
    const paymentOptionsContainer = document.querySelector('.payment-options');
    if (!paymentOptionsContainer) return;

    const paymentCards = paymentOptionsContainer.querySelectorAll('.payment-card');
    const totalCards = paymentCards.length;

    paymentCards.forEach(card => {
        card.style.width = '26.47%';
    });
    const lastRowStartIndex = Math.floor(totalCards / 3) * 3;
    if (totalCards % 3 === 0) {
        for (let i = totalCards - 3; i < totalCards; i++) {
            paymentCards[i].style.marginBottom = '0';
        }
    } else if ((totalCards - 1) % 3 === 0) {
        for (let i = totalCards - 4; i < totalCards - 1; i++) {
            paymentCards[i].style.marginBottom = '0';
        }
        paymentCards[totalCards - 1].style.marginBottom = '0';
    } else if (totalCards % 2 === 0) {
        for (let i = totalCards - 2; i < totalCards; i++) {
            paymentCards[i].style.marginBottom = '0';
        }
    } else if ((totalCards - 1) % 2 === 0) {
        for (let i = totalCards - 3; i < totalCards - 1; i++) {
            paymentCards[i].style.marginBottom = '0';
        }
        paymentCards[totalCards - 1].style.marginBottom = '0';
    }
    if (totalCards % 3 === 0) {

        return;
    }
    if ((totalCards - 1) % 3 === 0) {

        for (let i = 0; i < totalCards - 1; i++) {
            paymentCards[i].style.width = '26.47%';
        }

        paymentCards[totalCards - 1].style.width = '100%';
        return;
    }
    if (totalCards % 2 === 0) {
        paymentCards.forEach(card => {
            card.style.width = '42%';
        });
        return;
    }
    if ((totalCards - 1) % 2 === 0) {

        for (let i = 0; i < totalCards - 1; i++) {
            paymentCards[i].style.width = '42%';
        }

        paymentCards[totalCards - 1].style.width = '100%';
        return;
    }
    paymentCards.forEach(card => {
        card.style.width = '26.47%';
    });
}

function applyZoneLayoutRules() {
    const zonesContainer = document.querySelector('.zones-container');
    if (!zonesContainer) return;
    const zoneCards = zonesContainer.querySelectorAll('.zone-card');
    const totalCards = zoneCards.length;
    zoneCards.forEach(card => {
        card.style.width = '17.96%';
    });

    if (totalCards % 4 === 0) {
        for (let i = totalCards - 4; i < totalCards; i++) {
            zoneCards[i].style.marginBottom = '0';
        }
    } else if ((totalCards - 1) % 4 === 0) {
        for (let i = totalCards - 5; i < totalCards - 1; i++) {
            zoneCards[i].style.marginBottom = '0';
        }
        zoneCards[totalCards - 1].style.marginBottom = '0';
    } else if (totalCards % 3 === 0) {
        for (let i = totalCards - 3; i < totalCards; i++) {
            zoneCards[i].style.marginBottom = '0';
        }
    } else if ((totalCards - 1) % 3 === 0) {
        for (let i = totalCards - 4; i < totalCards - 1; i++) {
            zoneCards[i].style.marginBottom = '0';
        }
        zoneCards[totalCards - 1].style.marginBottom = '0';
    } else if (totalCards % 2 === 0) {
        for (let i = totalCards - 2; i < totalCards; i++) {
            zoneCards[i].style.marginBottom = '0';
        }
    } else if ((totalCards - 1) % 2 === 0) {
        for (let i = totalCards - 3; i < totalCards - 1; i++) {
            zoneCards[i].style.marginBottom = '0';
        }
        zoneCards[totalCards - 1].style.marginBottom = '0';
    }
    if (totalCards % 4 === 0) {

        return;
    }
    if ((totalCards - 1) % 4 === 0) {
        for (let i = 0; i < totalCards - 1; i++) {
            zoneCards[i].style.width = '17.96%';
        }

        zoneCards[totalCards - 1].style.width = '100%';
        return;
    }
    if (totalCards % 3 === 0) {
        zoneCards.forEach(card => {
            card.style.width = '26.47%';
        });
        return;
    }
    if ((totalCards - 1) % 3 === 0) {

        for (let i = 0; i < totalCards - 1; i++) {
            zoneCards[i].style.width = '26.47%';
        }

        zoneCards[totalCards - 1].style.width = '100%';
        return;
    }
    if (totalCards % 2 === 0) {
        zoneCards.forEach(card => {
            card.style.width = '42%';
        });
        return;
    }
    if ((totalCards - 1) % 2 === 0) {

        for (let i = 0; i < totalCards - 1; i++) {
            zoneCards[i].style.width = '42%';
        }

        zoneCards[totalCards - 1].style.width = '100%';
        return;
    }
    zoneCards.forEach(card => {
        card.style.width = '17.96%';
    });
}

function addPaymentCardWithoutReload(paymentData) {
    const paymentOptionsContainer = document.querySelector('.payment-options');
    if (!paymentOptionsContainer) return;
    const card = document.createElement('div');
    card.className = 'payment-card';

    const infoDiv = document.createElement('div');
    infoDiv.className = 'payment-info';

    const title = document.createElement('h3');
    title.className = 'option-title';
    title.textContent = paymentData.title;
    infoDiv.appendChild(title);

    const desc = document.createElement('p');
    desc.className = 'option-desc';
    desc.textContent = paymentData.desc;
    infoDiv.appendChild(desc);

    if (paymentData.additionalImages && paymentData.additionalImages.length > 0) {
        const optionImages = document.createElement('div');
        optionImages.className = 'option-images';
        paymentData.additionalImages.forEach(imgUrl => {
            const img = document.createElement('img');
            img.src = imgUrl;
            img.alt = 'Payment system';
            img.className = 'option-image';
            optionImages.appendChild(img);
        });
        infoDiv.appendChild(optionImages);
    }

    card.appendChild(infoDiv);
    const icon = document.createElement('img');
    icon.src = paymentData.iconUrl;
    icon.alt = paymentData.title;
    icon.className = 'payment-icon';
    card.appendChild(icon);

    paymentOptionsContainer.appendChild(card);
    updateOriginalPaymentCardsOrder();
}

function addZoneCard(zoneData) {
    saveZoneToStorage(zoneData);
    location.reload();
}