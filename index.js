/*
 Дарова проверяющие
 Леон Минасян 
 БИСТ-18-1
*/

//колво страниц от первой
var p = 15;
var prBar = document.getElementById("prBar");
var resP = document.getElementById("result");

//console.log(resP.innerText);
prBar.max = String(p);

function handleInput(ing) {
  //можно хоть через слэши 
  ing = ing.match(/\w+/ig);
  let ingstr = ing.join(',');
  let futReqs = [];
  for (let i = 0; i < p; i++) {
    futReqs.push(sendReq(ingstr, i+1));
  }
  //обнуление при рестарте
  prBar.value = 0;
  prBar.max = p;

  //асинхронно все запросы сразу
  axios.all(futReqs)
  .then( axios.spread(
    function () {
      //console.log(arguments);
      //соостветсвенно после выполнения всех идем обрабатывать
      console.log('end of transmission');
      handleMeals(arguments, ing);
    }
  ));
  //sendReq(ingstr, 1);
}

function sendReq(ingstr, pgstr) {
  //прокси потому что у ориг сайта неликвидные заголовки в ответе
  return axios.get(`https://cors-anywhere.herokuapp.com/http://www.recipepuppy.com/api/?i=${ingstr}&p=${pgstr}`)
    .then(function (response) {
    // handle success
    //console.log(response.data.results);
    console.log("Done page ", pgstr);
    //прогресс бар +
    prBar.value = Number(prBar.value) + 1;
    console.log(prBar.value);

    return response.data.results;
    })
    .catch(function (error) {
    // handle error
    console.log("Error on page ", pgstr);
    //прогресс бар -
    prBar.max = Number(prBar.max) - 1;
    });
}

function handleMeals(data, originIng) {
  let meals = [];
  console.log(originIng);
  for (let i = 0; i < data.length; i++) {
    if(data[i]) {
      //console.log("new page", data[i]);
      //"конкатинируем" все в один массив для простоты
      meals = meals.concat(data[i]);
    }
  }
  //console.log("meals ", meals);

  let locmin = [null, Infinity];

  for(let i = 0; i < meals.length; i++) {
    /*Доп проверка на соответствие первонач списку ингридиентов,
     тк сайт подсовывает дичь иногда
     из-за нее для того чтобы получить хороший результат
     список ингридиентов обычно должен быть большим
     И собственно выбор наименьшего 
    */
    if (meals[i].ingredients.split(', ').length < locmin[1]
      && meals[i].ingredients != '' 
      && !meals[i].ingredients.split(', ').some(val => originIng.indexOf(val) === -1)) {
      locmin = [i, meals[i].ingredients.split(', ').length]
    }
    console.log('check ', !meals[i].ingredients.split(', ').some(val => originIng.indexOf(val) === -1));
  };
  //console.log(meals[locmin[0]], locmin[1]);
  if(locmin[0]) {
    handleResult(meals[locmin[0]], locmin[1]);
  } else {
    handleFail();
  }
};

function handleResult(meal, cnt) {
  resP.innerHTML = meal.title + '<br> Всего ингридиентов ' + cnt + ': ' + meal.ingredients;
  if(meal.thumbnail) {
    resP.innerHTML += `<br><img src="${meal.thumbnail}" alt="Не удалось загрузить картинку"></img>`;
  }
  resP.innerHTML += `<br>Ссылка на <a href="${meal.href}">блюдо</a>`;
}

function handleFail() {
  resP.innerHTML = 'Сайт не дал результатов, точно удовлетворяющих запросу. Рекомендую увеличить список ингридиентов.';
}
//никогда не писал комменты на русском