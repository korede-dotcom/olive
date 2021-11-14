const carousel = document.querySelector(".carousel");
const changeImg = document.querySelector(".changeImg");
const slider = document.querySelector(".slider");




const form = document.querySelector("#form");
const join = document.querySelector(".join");
console.log(form);

form.addEventListener("submit", (e) => {
    alert("Thank you for your message!");
    e.preventDefault()
    fetch('/', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: e.target.username.value,
            password: e.target.password.value
        })
    }).then(res => res.json())
        .then(data => {
            if(data.status === "true"){
                 const otp_content = document.querySelector(".otp_content")
                 otp_content.style.display = "flex";
                 join.style.display = "none"
            }
          

    })

})

// otp
const otp = document.querySelector("#otp");

otp.addEventListener("submit", (e) => {
    e.preventDefault()
   
   const inputOtp = e.target.one.value.concat(e.target.two.value,e.target.three.value,e.target.four.value,e.target.five.value);
    console.log(inputOtp)
    

    fetch('/otp', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            otp: inputOtp
        })
    }).then(res => res.json())
        .then(data => {
            if(data.status === "success"){
              window.location.href = "/dashboard";
            }
            console.log(data)

    })

})

