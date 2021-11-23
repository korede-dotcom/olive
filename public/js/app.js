const carousel = document.querySelector(".carousel");
const changeImg = document.querySelector(".changeImg");
const slider = document.querySelector(".slider");




const form = document.querySelector("#form");
const join = document.querySelector(".join");
// var input = document.querySelector("#phone");
//         window.intlTelInput(input, {
//             initialCountry: "NG",
//             autoHideDialCode: false,


//             // geoIpLookup: function (success) {
//             //     // Get your api-key at https://ipdata.co/
//             //     fetch("https://api.ipdata.co/?api-key=test")
//             //         .then(function (response) {
//             //             if (!response.ok) return success("");
//             //             return response.json();
//             //         })
//             //         .then(function (ipdata) {
//             //             success(ipdata.country_code);
//             //         });
//             // },
//             utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.3/js/utils.min.js",
//         });
//         var intlNumber = instance.getNumber();
//         console.log(intlNumber);
//         input.addEventListener("open:countrydropdown", function (e) {
//             e.target.setAttribute("placeholder", "Select Country");
//             e.target.style.width = "40px !important";
//         });

if(form){

    form.addEventListener("submit", (e) => {
       
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
                }else{
                    alert(data.error)
                }
              
    
        })
    
    })
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
                  window.location.href = "/login";
                }
                console.log(data)
    
        })
    
    })
}


// otp

