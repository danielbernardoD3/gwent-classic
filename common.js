"use strict"

Array.prototype.remove = function(elem)
{
	const index = this.indexOf(elem);
	if (index !== -1)
		this.splice(index, 1);
}

function isEmpty(obj)
{
	for (const property in obj)
	{
		if (Object.hasOwn(obj, property))
			return false;
	}
	return true;
}

class RGBA
{
	constructor(r, g, b, a = 1)
	{
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}
	setAlpha(a)
	{
		this.a = a;
	}
	toString()
	{
		const hasAlpha = this.a < 1;
		return (hasAlpha ? "rgba(" : "rgb(") 
		+ this.r + ',' + this.g + ',' + this.b
		+ (hasAlpha ? "," + this.a : "")
		+ ")";
	}
}

// returns val or the min/max it is closest to. Flips inverted min/max values.
function clamp(min, max, val)
{
	if (min > max)
		return clamp(max, min, val);
	return Math.min(max, Math.max(min, val));
}

// Returns the linear interpolation of t from a to b (unclamped)
function lerp(a, b, t)
{
	return (1-t)*a + t*b;
}

// Returns the normalized value of t from the range [a,b]
function inverseLerp(a, b, t)
{
	return (t - a) / (b - a);
}

// Returns the lerp() of [y,z] using the normalized value of t in [a,b] as the param
function map(a, b, y, z, t)
{
	return lerp(y, z, inverseLerp(a, b, t));
}


// Returns true if n is an Number
function isNumber(n) { 
	return !isNaN(parseFloat(n)) && isFinite(n);
}

// Returns true if s is a String
function isString(s){
	return typeof(s) === 'string' || s instanceof String;
}

// Interprets passed string as an interger. Empty strings return 0, null string return NaN
function toInteger(str)
{
	if (str === '')
		return 0;
	else if (!str)
		return NaN;
	return Number.parseInt(str);
}

// Returns a random integer in the range [0,n)
function randomInt(n)  {
	return Math.floor(Math.random() * n);
}


// ---------------------------------------------------------------------------
// RESPONSIVE GAME BOARD FITTER (LETTERBOXING / PILLARBOXING COM BARRAS PRETAS)
// Garante que todo o tabuleiro 16:9 caiba verticalmente na tela sem rolagem,
// centralizando e gerando barras pretas nas laterais em telas ultrawide e celulares.
// ---------------------------------------------------------------------------
function fitGameBoard() {
	const main = document.querySelector("main");
	const deckCust = document.getElementById("deck-customization");
	const w = window.innerWidth;
	const h = window.innerHeight;
	if (!w || !h) return;

	const baseAspect = 1920 / 1080;
	const currentAspect = w / h;

	// Se a tela for mais larga que 16:9 (celulares 19.5:9, 20:9 ou ultrawide):
	// O tabuleiro (100vw) ultrapassaria a altura. Escalamos para caber 100% em 100vh.
	const scale = currentAspect > baseAspect ? (h * 1920) / (w * 1080) : 1;

	[main, deckCust].forEach(elem => {
		if (!elem) return;
		elem.style.left = "50%";
		elem.style.top = "50%";
		elem.style.transform = `translate(-50%, -50%) scale(${scale})`;
		elem.style.transformOrigin = "center center";
	});
}

window.addEventListener("resize", fitGameBoard);
window.addEventListener("orientationchange", () => setTimeout(fitGameBoard, 150));
document.addEventListener("DOMContentLoaded", fitGameBoard);
window.fitGameBoard = fitGameBoard;
