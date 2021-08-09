"use strict";

const cartButton = document.querySelector("#cart-button");
const close = document.querySelector(".close");

function toggleModal() {
  modal.classList.toggle("is-open");
}

const buttonAuth = document.querySelector(".button-auth");
const modalAuth = document.querySelector(".modal-auth");
const closeAuth = document.querySelector(".close-auth");
const logInForm = document.querySelector("#logInForm");
const logInInput = document.querySelector("#login");
const userName = document.querySelector(".user-name");
const buttonOut = document.querySelector(".button-out");
const cardsRestaurants = document.querySelector(".cards-restaurants");
const logo = document.querySelector(".logo");
const restaurants = document.querySelector(".restaurants");
const promo = document.querySelector(".container-promo");
const menu = document.querySelector(".menu");
const cardsMenu = document.querySelector(".cards-menu");
const basketButton = document.querySelector(".button-cart");
const modalBody = document.querySelector(".modal-body");
const restaurantTitle = document.querySelector(".restaurant-title");
const modal = document.querySelector(".modal");
const clearBasket = document.querySelector(".clear-cart");
const modalFinalPrice = document.querySelector(".modal-pricetag");
const restaurantsData = [];
const cardsBasket = [];

let login = localStorage.getItem("Login");

function authorized() {

  userName.textContent = login;

  function logOut() {
    login = null;

    localStorage.removeItem("Login");

    buttonAuth.style.display = "";
    userName.style.display = "";
    buttonOut.style.display = "";
    cartButton.style.display = ""; //day 4
    buttonOut.removeEventListener("click", logOut);
    checkAuth();
  }

  buttonAuth.style.display = "none";
  userName.style.display = "inline";
  buttonOut.style.display = "flex";
  cartButton.style.display = "flex"; //day 4

  buttonOut.addEventListener("click", logOut);
}

function notAuthorized() {

  function logIn(event) {
    event.preventDefault();
    login = logInInput.value;

    if (login) {

      localStorage.setItem("Login", login);
      toogleModalAuth();
      buttonAuth.removeEventListener("click", toogleModalAuth);
      closeAuth.removeEventListener("click", toogleModalAuth);
      logInForm.removeEventListener("submit", logIn);
      logInForm.reset();
      checkAuth();
    } else {
      alert("Введите Ваши данные");
    }
  }

  buttonAuth.addEventListener("click", toogleModalAuth);
  closeAuth.addEventListener("click", toogleModalAuth);
  logInForm.addEventListener("submit", logIn);
  mainTitle()
}

function toogleModalAuth() {
  modalAuth.classList.toggle("is-open");
}

function checkAuth() {
  if (login) {
    authorized();
  } else {
    notAuthorized();
  }
}

checkAuth();

async function getItem(url) {

    const res = await fetch(`../db/${url}`);

    if (!res.ok) {
        throw new Error (`Could not fetch ${url}, error status ${res.status}`)
    }

    return await res.json()
}

function createCardsRestaurants() {

    getItem("partners.json")
    .then(items => items.map((item) => {

   
        const {name, stars, price, kitchen, image, products, time_of_delivery} = item;
        restaurantsData.push(item);
        const newItem = `

            <a class="card card-restaurant" data-products="${products}" data-name="${name}">
            <img src="${image}" alt="image" class="card-image"/>
            <div class="card-text">
              <div class="card-heading">
                <h3 class="card-title">${name}</h3>
                <span class="card-tag tag">${time_of_delivery}</span>
              </div>
              <div class="card-info">
                <div class="rating">
                  ${stars}
                </div>
                <div class="price">От ${price}</div>
                <div class="category">${kitchen}</div>
              </div>
            </div>
        `
        cardsRestaurants.insertAdjacentHTML("afterbegin", newItem);
    }))
}

function createMenuHeader(name) {

    const indexItem = restaurantsData.findIndex((item) => item.name === name);
    const item = restaurantsData[indexItem];
    const menuHeader = `
                    <div class="section-heading">
                        <h2 class="section-title restaurant-title">${item.name}</h2>
                        <div class="card-info">
                            <div class="rating">
                                ${item.stars}
                            </div>
                            <div class="price"> От ${item.price} руб.</div>
                            <div class="category">${item.kitchen}</div>
                        </div>
                    </div>               
                `
    restaurantTitle.innerHTML = menuHeader;
}

function createCardGoods(event) {

    if (login) {

        if (event.target.closest(".card-restaurant")) {

            cardsMenu.textContent = "";
            const restaurant = event.target.closest(".card-restaurant");
            createMenuHeader(restaurant.dataset.name);
    
            getItem(restaurant.dataset.products)
            .then(items => items.map((item) => {
    
                const {name, description, price, image, id} = item;
                const card = document.createElement("div");
                card.className = "card";
                card.id = id;
                const newItem = 
                `
                    <img src="${image}" alt="image" class="card-image"/>
                    <div class="card-text">
                      <div class="card-heading">
                        <h3 class="card-title card-title-reg">${name}</h3>
                      </div>
                      <div class="card-info">
                        <div class="ingredients">${description}
                        </div>
                      </div>
                      <div class="card-buttons">
                        <button class="button button-primary button-add-cart" id="${id}">
                          <span class="button-card-text">В корзину</span>
                          <span class="button-cart-svg"></span>
                        </button>
                        <strong class="card-price-bold">${price}</strong>
                      </div>
                    </div>
                `
    
                card.insertAdjacentHTML("afterbegin", newItem);
                cardsMenu.insertAdjacentElement("afterbegin", card);
                restaurants.classList.add("hide");
                promo.classList.add("hide");
                menu.classList.remove("hide");
            }))
        }
    } else {
        toogleModalAuth();
    }
}

function renderCardBasket() {

    console.log("hello")

    modalBody.classList.remove("hide");
    modalBody.textContent = "";

    cardsBasket.map((item) => {

        const {id, title, price, quantity} = item;

        const newItem = `
        <div class="food-row">
            <span class="food-name">${title}</span>
            <strong class="food-price">${price}</strong>
            <div class="food-counter">
                <button class="counter-button counter-minus" data-id=${id}>-</button>
                <span class="counter">${quantity}</span>
                <button class="counter-button counter-plus" data-id=${id}>+</button>
            </div>
        </div>
    `
        modalBody.insertAdjacentHTML("afterbegin", newItem);
    })

    const finalPrice =  cardsBasket.reduce((result, item) => {
        return result = result + item.price * item.quantity;
    }, 0);
    modalFinalPrice.textContent = finalPrice + " Р";
}

function addGoodToBasket(event) {

   if (event.target.closest(".button-add-cart")) {
       const card = event.target.closest(".card");
       const title = card.querySelector(".card-title-reg").textContent;
       const price = card.querySelector(".card-price-bold").textContent;
       const id = card.id;
       const findItem = cardsBasket.find((item) => item.id === card.id);

       if (findItem) {

           findItem.quantity++

       } else {
            const newBasketItem = {
                id,
                title,
                price,
                quantity: 1
            }

            cardsBasket.push(newBasketItem);
       }
   }
}

function changeQuantity(event) {

    if (event.target.classList.contains("counter-button")) {

        const food = cardsBasket.find((item) => item.id === event.target.dataset.id);
       
        if (event.target.classList.contains("counter-plus")) {
            food.quantity++
        }

        if (event.target.classList.contains("counter-minus")) {

            food.quantity--

            if (food.quantity === 0) {
                cardsBasket.splice(cardsBasket.indexOf(food), 1)
            }
        }

        renderCardBasket()

    }
}

function mainTitle() {
    restaurants.classList.remove("hide");
    promo.classList.remove("hide");
    menu.classList.add("hide");
}

function init() {
    
    createCardsRestaurants();

    cardsRestaurants.addEventListener("click", createCardGoods);
    logo.addEventListener("click", mainTitle);

    basketButton.addEventListener("click", () => {
        renderCardBasket();
        toggleModal();
    });

    cardsMenu.addEventListener("click", addGoodToBasket);
    close.addEventListener("click", toggleModal);

    clearBasket.addEventListener("click", () => {
        cardsBasket.length = 0;
        modalBody.textContent = "";
        modalFinalPrice.textContent = "0 Р";
    });

    modalBody.addEventListener("click", changeQuantity);

}

init();

