/**
 * CalcuFinanzas Pro - Lógica de la Aplicación
 * JS Vainilla puro, sin dependencias.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar la primera pestaña y calcular valores por defecto
    calcInterest();
    calcMargin();
    calcFreelance();
    
    // Inicializar Banner de Cookies
    initCookieBanner();
});

/**
 * Función para cambiar de pestaña (Calculadora)
 * @param {string} tabId - ID de la pestaña a activar ('interest', 'margin', 'freelance')
 */
function switchTab(tabId) {
    // 1. Ocultar todas las secciones
    const sections = document.querySelectorAll('.tool-section');
    sections.forEach(sec => {
        sec.classList.remove('block');
        sec.classList.add('hidden');
    });

    // 2. Mostrar la sección seleccionada
    const activeSection = document.getElementById(`sec-${tabId}`);
    if (activeSection) {
        activeSection.classList.remove('hidden');
        activeSection.classList.add('block');
    }

    // 3. Actualizar estilos de los botones (Pestañas)
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        // Reset a estado inactivo (blanco con texto gris)
        tab.classList.remove('bg-accent-500', 'text-white', 'hover:bg-accent-600');
        tab.classList.add('bg-white', 'text-brand-700', 'hover:bg-brand-100');
    });

    // Estado activo para el botón clickeado
    const activeTab = document.getElementById(`tab-${tabId}`);
    if (activeTab) {
        activeTab.classList.remove('bg-white', 'text-brand-700', 'hover:bg-brand-100');
        activeTab.classList.add('bg-accent-500', 'text-white', 'hover:bg-accent-600');
    }
}

/**
 * Sincroniza un input numérico con su respectivo slider (range) y viceversa.
 * @param {string} targetId - ID del elemento destino a actualizar
 * @param {string|number} value - Nuevo valor
 */
function syncInput(targetId, value) {
    const el = document.getElementById(targetId);
    if (el) {
        el.value = value;
    }
}

/**
 * Utilidad para formatear números como moneda (USD)
 */
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

/**
 * Calculadora 1: Interés Compuesto
 */
function calcInterest() {
    const principal = parseFloat(document.getElementById('ci-principal').value) || 0;
    const addition = parseFloat(document.getElementById('ci-addition').value) || 0;
    const rate = parseFloat(document.getElementById('ci-rate').value) || 0;
    const years = parseInt(document.getElementById('ci-years').value) || 0;

    const r = rate / 100;
    const months = years * 12;

    // Cálculo del principal compuesto
    let futureValuePrincipal = principal * Math.pow(1 + r, years);

    // Cálculo del valor futuro de las aportaciones mensuales
    // Asumimos capitalización anual, pero depósitos mensuales. 
    // Para simplificar y hacerlo estándar para el usuario medio: 
    // Valor futuro de una anualidad = PMT * (((1 + r/n)^(nt) - 1) / (r/n))
    // Donde PMT es la aportación mensual, n=12.
    let ratePerMonth = r / 12;
    let futureValueAdditions = 0;
    
    // Si rate es > 0 calculamos con la fórmula, si no, es solo suma lineal
    if (ratePerMonth > 0) {
        futureValueAdditions = addition * ((Math.pow(1 + ratePerMonth, months) - 1) / ratePerMonth);
        // Ajustamos el principal para que se capitalice mensualmente y coincida matemáticamente exacto
        futureValuePrincipal = principal * Math.pow(1 + ratePerMonth, months);
    } else {
        futureValueAdditions = addition * months;
    }

    const totalBalance = futureValuePrincipal + futureValueAdditions;
    const totalInvested = principal + (addition * months);
    const totalEarned = totalBalance - totalInvested;

    document.getElementById('ci-total').textContent = formatCurrency(totalBalance);
    document.getElementById('ci-invested').textContent = formatCurrency(totalInvested);
    document.getElementById('ci-earned').textContent = formatCurrency(totalEarned > 0 ? totalEarned : 0);
}

/**
 * Calculadora 2: Margen de Ganancia
 */
function calcMargin() {
    const cost = parseFloat(document.getElementById('mg-cost').value) || 0;
    const margin = parseFloat(document.getElementById('mg-margin').value) || 0;

    // Evitar división por cero o márgenes >= 100% (imposible matemáticamente para margen neto)
    let marginDecimal = margin / 100;
    if (marginDecimal >= 1) marginDecimal = 0.99; // Cap al 99%

    // Precio = Costo / (1 - Margen)
    const price = cost / (1 - marginDecimal);
    const profit = price - cost;
    
    // Markup = (Ganancia / Costo) * 100
    const markup = cost > 0 ? (profit / cost) * 100 : 0;

    document.getElementById('mg-price').textContent = formatCurrency(price);
    document.getElementById('mg-profit').textContent = formatCurrency(profit);
    document.getElementById('mg-markup').textContent = `${markup.toFixed(2)}%`;
}

/**
 * Calculadora 3: Tarifas Freelance
 */
function calcFreelance() {
    const net = parseFloat(document.getElementById('fl-net').value) || 0;
    const feePct = parseFloat(document.getElementById('fl-fee-pct').value) || 0;
    const feeFix = parseFloat(document.getElementById('fl-fee-fix').value) || 0;

    // Fórmula para calcular el monto a cobrar para recibir el neto deseado
    // Charge = (Net + Fixed) / (1 - (Pct / 100))
    
    let feeDecimal = feePct / 100;
    if (feeDecimal >= 1) feeDecimal = 0.99;

    const charge = (net + feeFix) / (1 - feeDecimal);
    const totalFees = charge - net;
    
    const effectiveRate = charge > 0 ? (totalFees / charge) * 100 : 0;

    document.getElementById('fl-charge').textContent = formatCurrency(charge);
    document.getElementById('fl-fees').textContent = formatCurrency(totalFees);
    document.getElementById('fl-effective').textContent = `${effectiveRate.toFixed(2)}%`;
}

/**
 * Utilidad para setear rápidamente las tarifas (botones preajustes)
 */
function setFee(pct, fix) {
    document.getElementById('fl-fee-pct').value = pct;
    document.getElementById('fl-fee-fix').value = fix;
    calcFreelance();
}

/**
 * Lógica del Banner de Cookies
 */
function initCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (!banner) return;
    
    // Verificar si ya se aceptaron las cookies
    if (!localStorage.getItem('cookiesAccepted')) {
        // Mostrar el banner con un pequeño retraso
        setTimeout(() => {
            banner.classList.remove('translate-y-full');
        }, 1000);
    }
}

function acceptCookies() {
    const banner = document.getElementById('cookie-banner');
    if (banner) {
        // Ocultar banner
        banner.classList.add('translate-y-full');
        // Guardar preferencia en el navegador
        localStorage.setItem('cookiesAccepted', 'true');
    }
}
