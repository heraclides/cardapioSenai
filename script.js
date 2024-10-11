const menu = document.getElementById("menu")
const cartBtn = document.getElementById("cart-btn")
const btnReceita = document.getElementById("btn-receita")
const cartModal = document.getElementById("cart-modal")
const cartReceita = document.getElementById("cart-receita")
const cartItemsContainer=document.getElementById("cart-items")
const cartTotal = document.getElementById("cart-total")
const checkoutBtn = document.getElementById("checkout-btn")
const closeModalBtn = document.getElementById("close-modal-btn")
const cartCounter = document.getElementById('cart-count')
const addressInput = document.getElementById("address")
const zapInput = document.getElementById("zap")
const addressWarn = document.getElementById("address-warn");
const zapWarn = document.getElementById("zap-warn");
const itensCount = document.getElementById('itens-count')

document.addEventListener('DOMContentLoaded', function() {
    // Chama a função checkOpen para verificar o estado do restaurante ao carregar a página
    checkOpen();
});

let cart = [];
let quantidadeItem = 0

//Abrir o model do carrinho
cartBtn.addEventListener("click", function(){
    updateCartModel();
    cartModal.style.display="flex"
    
})

btnReceita.addEventListener("click", function(){
    updateCartReceita();
    cartReceita.style.display="flex"
    
})

//fechar o modal quando clicar fora
cartModal.addEventListener("click", function(event){
    if(event.target===cartModal){
        cartModal.style.display="none"
    }
})

cartReceita.addEventListener("click", function(event){
    if(event.target===cartReceita){
        cartReceita.style.display="none"
    }
})

//Botão fechar do nosso carrinho
closeModalBtn.addEventListener("click", function(){
    cartModal.style.display="none"
})


menu.addEventListener("click", function(event){
    // console.log(event.target)

    let parentButton= event.target.closest(".add-to-cart-btn")

    if(parentButton){
        const name = parentButton.getAttribute("data-name")
        const price = parseFloat(parentButton.getAttribute("data-price"))
        addToCart(name, price)
        //Adicionar no carrinho
    }
})


//Função para adicionar no carrinho
function addToCart(name, price){
    const existingItem = cart.find(item =>item.name === name)

    if(existingItem){
        //Se o item já existe, aumenta apenas a quantidade
        existingItem.quantity += 1;
        // alert(`foi add mais um ${name} quantidade: ${existingItem.quantity}`)
        Toastify({
            text: `Foi add mais um ${name} quantidade: ${existingItem.quantity}`,
            duration: 3000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "left", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
              background: "#ef4444",
            },
          }).showToast();
    }else{
        cart.push({
            name,
            price,
            quantity:1,
        })
    }
   
    updateCartModel()
}

//atualiza o carrinho
function updateCartModel(){
    cartItemsContainer.innerHTML='';
    let total=0;
    let totalItem=0;

    cart.forEach(item=>{
        const cartItemElement =document.createElement("div")
        cartItemElement.classList.add("flex", "justify-between", "mb-4", "flex-col")
        
        cartItemElement.innerHTML = `
        <div class = "flex items-center justify-between">
            <div>
                <p class="font-medium">${item.name}</p>
                <p>Qtd: ${item.quantity}</p>
                <p class="font-medium mt-2">${item.price.toFixed(2)}</p>
            </div>

                <button class="remove-from-cart-btn" data-name="${item.name}">
                    Remover
                </button>
        </div>
        `
        total += item.price * item.quantity
        quantidadeItem = item.quantity
        totalItem += quantidadeItem;
        cartItemsContainer.appendChild(cartItemElement);
        itensCount.innerHTML = totalItem
        console.log (cartItemElement)
        console.log(itensCount)
    })

    cartTotal.textContent = total.toLocaleString("pt-BR",{
        style:"currency",
        currency:"BRL"
    });

    cartCounter.innerHTML = cart.length;

    console.log(cart.length)
}   


//função para remover o item do carrinho
cartItemsContainer.addEventListener("click", function(event){
    if(event.target.classList.contains("remove-from-cart-btn")){
        const name = event.target.getAttribute("data-name")

        removeItemCart(name);
    }
})

function removeItemCart(name){
    const index = cart.findIndex(item => item.name === name);

    if(index !== -1){
        const item = cart[index]
        
        if(item.quantity > 1){
            item.quantity -= 1;
            updateCartModel();
            return;
        }else{
            item.quantity = 0
            updateCartModel();
        }

        cart.splice(index, 1);
        updateCartModel	();
    }
}


//Pegar a informação do input do endereço
addressInput.addEventListener("input", function(event){
    let inputValue= event.target.value;

    if(inputValue !== ""){
        addressInput.classList.remove("border-red-500")
        addressWarn.classList.add("hidden")
    }
})

//Pegar a informação do input do whatzapp


//finalizar o pedido
checkoutBtn.addEventListener("click", function(){

    //verifica se o restaurante esta fechado
    const isOpen = checkRestaurantOpen();
if (!isOpen) {
    Toastify({
        text: "Restaurante fechado",
        duration: 3000,
        close: true,
        gravity: "top", // `top` ou `bottom`
        position: "left", // `left`, `center` ou `right`
        stopOnFocus: true, // Impede o fechamento do toast ao passar o mouse
        style: {
            background: "#ef4444",
        },
    }).showToast();
    return;
}

if (cart.length === 0) return;

if (addressInput.value === "") {
    addressWarn.classList.remove("hidden");
    addressInput.classList.add("border-red-500");
    return;
}

if (zapInput.value === "") {
    zapWarn.classList.remove('hidden');
    zapInput.classList.add('border-red-500');
    return;
}

// Validação do formato do número do WhatsApp
zapInput.addEventListener('input', function() {

    //remove todos os caracteres que não são digitos
    this.value = this.value.replace(/\D/g, '');

    const isValid = /^\d{11}$/.test(this.value); // Verifica se o número tem 11 dígitos

    if (!isValid && this.value.length>0) {
        zapWarn.classList.remove('hidden');
        zapInput.classList.add('border-red-500');
        return;
    } else {
        zapWarn.classList.add('hidden');
        zapInput.classList.remove('border-red-500');
    }
});

const zapValue = zapInput.value;
    if (zapValue === "" || !/^\d{11}$/.test(zapValue)) {
        zapWarn.classList.remove('hidden');
        zapInput.classList.add('border-red-500');
        return; // Impede o envio se não for um número válido
    }


// Enviar o pedido para o WhatsApp
const cartItems = cart.map((item) => {
    return `${item.name} Quantidade: (${item.quantity}) Preço: R$${item.price} |`;
}).join("");

const message = encodeURIComponent(cartItems);
const phone = zapInput.value; // Usar o número de WhatsApp do input

window.open(`https://wa.me/${phone}?text=${message} Endereço: ${addressInput.value}`, "_blank");
document.getElementById('itens-count').textContent = 0;
cart = [];
updateCartModel();

})

let openHour = 8 
let closeHour = 22

function setOperatingHours(open, close) {
    openHour = open;
    closeHour = close;
}

//verificar a hora e manipular o card horario

function checkRestaurantOpen(){
    const data = new Date();
    const hora = data.getHours();
    return hora >= openHour && hora < closeHour;
    //true = restaurante aberto
}
document.getElementById('set-hours').addEventListener('click', function() {
    const openTime = document.getElementById('open-time').value; // Formato: HH:MM
    const closeTime = document.getElementById('close-time').value; // Formato: HH:MM

    // Extrai a hora e converte para número inteiro
    const openHourNum = parseInt(openTime.split(':')[0], 10);
    const closeHourNum = parseInt(closeTime.split(':')[0], 10);
    
    // Atualiza os horários de funcionamento
    setOperatingHours(openHourNum, closeHourNum);

    // Atualiza o horário exibido
    const newHours = `Seg à Dom - ${openTime} às ${closeTime}`;
    document.getElementById('hours').innerText = newHours;

    // Verifica se o restaurante está aberto
    checkOpen()
});


function checkOpen() {
    const spanItem = document.getElementById("date-span");
    const isOpen = checkRestaurantOpen();

    if (!isOpen) {
        // Se o restaurante estiver fechado
        Toastify({
            text: "Restaurante fechado",
            duration: 3000,
            close: true,
            gravity: "top", // `top` ou `bottom`
            position: "left", // `left`, `center` ou `right`
            stopOnFocus: true, // Impede o fechamento do toast ao passar o mouse
            style: {
                background: "#ef4444",
            },
        }).showToast();

        spanItem.classList.remove("bg-green-600");
        spanItem.classList.add("bg-red-500");
    } else {
        // Se o restaurante estiver aberto
        Toastify({
            text: "Restaurante Aberto",
            duration: 3000,
            close: true,
            gravity: "top", // `top` ou `bottom`
            position: "left", // `left`, `center` ou `right`
            stopOnFocus: true, // Impede o fechamento do toast ao passar o mouse
            style: {
                background: "#33c55e",
            },
        }).showToast();
        spanItem.classList.remove("bg-red-500");
        spanItem.classList.add("bg-green-600");
    }
}

function updateCartReceita(){
    cartItemsContainer.innerHTML='';
    let total=0;
    let totalItem=0;

    cart.forEach(item=>{
        const cartItemElement =document.createElement("div")
        cartItemElement.classList.add("flex", "justify-between", "mb-4", "flex-col")
        
        cartItemElement.innerHTML = `
        <div class = "flex items-center justify-between">
            <div>
                <p class="font-medium">${item.name}</p>
                <p>Qtd: ${item.quantity}</p>
                <p class="font-medium mt-2">${item.price.toFixed(2)}</p>
            </div>

                <button class="remove-from-cart-btn" data-name="${item.name}">
                    Remover
                </button>
        </div>
        `
        total += item.price * item.quantity
        quantidadeItem = item.quantity
        totalItem += quantidadeItem;
        cartItemsContainer.appendChild(cartItemElement);
        itensCount.innerHTML = totalItem
        console.log (cartItemElement)
        console.log(itensCount)
    })

    cartTotal.textContent = total.toLocaleString("pt-BR",{
        style:"currency",
        currency:"BRL"
    });

    cartCounter.innerHTML = cart.length;

    console.log(cart.length)
} 

