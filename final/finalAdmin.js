let orderData =[];
const orderList = document.querySelector('.js-orderList')

function init(){
    getOrderList();
}
init();

function renderC3(){
    console.log(orderData);
    //物件資料蒐集  
    let total = {};
    orderData.forEach(function(item){
        item.products.forEach(function(productItem){
            
            if(total[productItem.category] == undefined){
                total[productItem.category] = productItem.price * productItem.quantity;
            }else {
                total[productItem.category] += productItem.price * productItem.quantity;
            }
        })     
    })

    console.log(total)
    //資料關聯
    let categoryAry = Object.keys(total);
    console.log(categoryAry);
    
    let newData = [];
    categoryAry.forEach(function(item){
        let ary = [];
        ary.push(item);
        ary.push(total[item]);
        newData.push(ary);
    })
    console.log(newData);

    //c3.js
    let chart = c3.generate({
        bindto: '#chart',  // HTML 元素綁定
        data: {
            type: "pie",
            columns:newData
        },
    });
}

function getOrderList(){
    axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders`,
        { 
        headers:{
        "Authorization": token,
        }  
    })
    .then(function(response){
        orderData = response.data.orders;
                
        let str = '';
        orderData.forEach(function(item){

            //組產品字串
            let productStr = "";
            item.products.forEach(function(productItem){
                productStr += `<p>${productItem.title}x${productItem.quantity}</p>`
            })

            //判斷訂單處理狀態
            let orderStatus = "";
            if (item.paid == true){
                orderStatus="已處理";
            }else {
                orderStatus="未處理";
            }

            //時間狀態
            const timeStamp = new Date(item.createdAt*1000);
            const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDate()}`;

            //組訂單字串
            str+= `<tr>
            <td>${item.id}</td>
            <td>
              <p>${item.user.name}</p>
              <p>${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>
              <p>${productStr}</p>
            </td>
            <td>${orderTime}</td>
            <td class="js-orderStatus">
              <a href="#" class="orderStatus" data-status="${item.paid}" data-id="${item.id}" >${orderStatus}</a>
            </td>
            <td>
              <input type="button" class="delSingleOrder-Btn" data-id="${item.id}" value="刪除">
            </td>
        </tr>`
        })
        orderList.innerHTML = str;
        renderC3();
    })

}

orderList.addEventListener("click",function(e){
    e.preventDefault();
    const targetClass = e.target.getAttribute("class");
    let id = e.target.getAttribute("data-id");
    // console.log(targetClass);

    if (targetClass == "delSingleOrder-Btn" ){
        alert("你點擊到刪除");
        deletOrderItem(id);
        return;
    }

    if (targetClass == "orderStatus"){
        alert("你點擊到訂單狀態");
        let status = e.target.getAttribute("data-status");
        changeOrderStatusItem(status,id)
        return;
    }
})

// 更改訂單狀態
function changeOrderStatusItem(status,id){
console.log(status,id);
let newStatus;
if (status == true){
    newStatus = false;
}else {
    newStatus = true
}

axios.put(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders`,{
    "data": {
        "id": id,
        "paid": newStatus
      }
},{ 
    headers:{
    "Authorization": token,
    }  
    })
    .then(function(response){
        alert("訂單狀態修改成功")
        getOrderList();
    })
}

function deletOrderItem (id){
    axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders/${id}`,
        { 
        headers:{
        "Authorization": token,
        }  
    })
    .then(function(response){
        alert("刪除該筆訂單成功");
        getOrderList();
    })
}

const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener("click",function(e){
    e.preventDefault();
    axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders`,
        { 
        headers:{
        "Authorization": token,
        }  
    })
    .then(function(response){
        alert("刪除全部訂單成功");
        getOrderList();
    })
})

