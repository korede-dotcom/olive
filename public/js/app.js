       
 const select = document.querySelector(".flex-form select");
 const numberform = document.querySelector(".numberform");
 const ccode = document.querySelector("#code");
       

 fetch("https://countriesnow.space/api/v0.1/countries/flag/unicode", requestOptions)
 .then(response => response.json())
 .then(result => {
     
     select.innerHTML = result.data.map(e => `
     <option selected value=${e.name}>
     ${e.unicodeFlag}
     </option>
     `).join("")
     
     // select.innerHTML = "hi"

 })
 .catch(error => console.log('error', error));



 numberform.addEventListener("change",(e)=>{
     const selected = e.target.value
     

     var requestOptions = {
        method: 'GET',
        redirect: 'follow'
      };
      
      fetch("https://countriesnow.space/api/v0.1/countries/codes", requestOptions)
        .then(response => response.json())
        .then(result => {
            const code = result.data.filter((d)=>{
                return d.name === selected
            })
            console.log(code)
            ccode.value = code[0].dial_code
        })
        .catch(error => console.log('error', error));
     
 })