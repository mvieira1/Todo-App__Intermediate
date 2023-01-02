document.addEventListener('DOMContentLoaded', () => {

    //SUBMIT FORM
    const form = document.querySelector('form');
    //console.log(form);
    
    form.addEventListener('submit', (eventObject) => {
        console.log(eventObject.defaultPrevented); //false
        eventObject.preventDefault();
        //cancela a default action que pertence ao event (neste caso, a default action é a atualizaçao da página a cada nova submissão do formulário). Se não cancelasse, sempre que submetesse um novo TODO, ele ia desaparecer imediatamente, pq a página voltaria ao default state e só apareceriam os elementos originalmente descritos no html
        console.log(eventObject.defaultPrevented); //true :)
        todoValidation();
    });

    //FORM VALIDATION
    const input = document.querySelector('input');
    const errorMsg = document.querySelector('.error-msg');

    function todoValidation(){
        if(input.value === ''){
            errorMsg.innerHTML = 'The text field is empty. Nothing to do?';
        }else{
            errorMsg.innerHTML = '';
            addTodo();
            //RESET FORM
            input.value = '';
        };
    };
    
    //UPDATE DATA
    const todoItemsDiv = document.querySelector('.todo-items');
    const todoItemsInfoS = document.querySelectorAll('.todo-items-info'); //seleciona os 2 todosItemsInfo (o da Desktop View e o da Mobile/OtherDevices View)
    const itemsLeft = document.querySelector('.items-left span');

    function addTodo(){
        //podia, simplesmente, ter editado o innerHTML do todoItemsDiv, como fiz na função local storage, mas vou fazer assim para efeitos de prática

        const divTodoItem = document.createElement('div');
        divTodoItem.classList.add('todo-item');

        const divCheck = document.createElement('div');
        divCheck.classList.add('check');

        const divCheckMark = document.createElement('div');
        divCheckMark.classList.add('check-mark');

        const img = document.createElement('img');
        img.setAttribute('src', 'images/icon-check.svg');
        img.style.visibility = 'hidden';

        const divTodoText = document.createElement('div');
        divTodoText.classList.add('todo-text');

        const divDelete = document.createElement('div');
        divDelete.classList.add('delete-img');

        const imgCross = document.createElement('img');
        imgCross.classList.add('delete');
        imgCross.setAttribute('src', 'images/icon-cross.svg');
        
        divCheckMark.appendChild(img);
        divCheck.appendChild(divCheckMark);
        divTodoItem.appendChild(divCheck);
        divTodoText.innerText = input.value;
        divTodoItem.appendChild(divTodoText);
        divDelete.appendChild(imgCross);
        divTodoItem.appendChild(divDelete);
        todoItemsDiv.appendChild(divTodoItem);

        //add to the local storage
        localStorage(input.value);

        divTodoItem.classList.add('active');

        itemsLeft.innerHTML = +itemsLeft.innerHTML + 1;
    };

    //CHECK MARKS
    todoItemsDiv.addEventListener('click', (eventObject) => {
        //console.log(eventObject);
        const item = eventObject.target;
        if(item.classList.contains('check-mark')){ //se clicou na bolinha
            if(!item.classList.contains('check-mark-completed')){ //se não estiver completa, passa a estar
                item.classList.add('check-mark-completed');
                item.children[0].style.visibility = 'visible';
                item.parentElement.nextElementSibling.classList.add('line-through');
                //e é descontado do itemsLeft
                itemsLeft.innerHTML = +itemsLeft.innerHTML - 1;
                //removo a class active do divTodoItem e adiciono a classe completed
                item.parentElement.parentElement.classList.remove('active');
                item.parentElement.parentElement.classList.add('completed');

            }else if(item.classList.contains('check-mark-completed')){ //se estiver completa, é desmarcada
                item.classList.remove('check-mark-completed');
                item.children[0].style.visibility = 'hidden';
                item.parentElement.nextElementSibling.classList.remove('line-through');
                //e contabilizo no itemsLeft
                itemsLeft.innerHTML = +itemsLeft.innerHTML + 1;
                //removo a class completed do divTodoItem e adiciono a class active
                item.parentElement.parentElement.classList.remove('completed');
                item.parentElement.parentElement.classList.add('active');
            };

            //PROBLEMA ATUAL: só estou a considerar o caso, para o qual o utilizador clica no div.check-mark. Se já estiver marcado como completed e calhar de clicar na img da .check-mark, o todo não vai mudar para active... SOLUÇÃO: adicionei, em CSS a propriedade pointer-events: none à img. Assim o user pode clicar through it

        }else if(item.classList.contains('todo-text')){//se clicou no texto do todo já inserido, colocar o texto novamente no input para poder ser editado
            input.value = item.innerHTML;

        }else if(item.classList.contains('delete')){//se clicou na cruzinha,
            //remove o todo da página
            item.parentElement.parentElement.remove();
            //remove do local storage
            removeFromLocalStorage(item.parentElement.parentElement.innerText);
            //se o todo NÃO estiver marcado como completed, desconta dos items left (pq se estiver, já foi descontado (num if/else statement anterior) e, sem esta condição, descontaria duas vezes. 
            if(!item.parentElement.parentElement.classList.contains('completed')){
                itemsLeft.innerHTML = +itemsLeft.innerHTML - 1;
            };
        };
    });

    //ITEM STATUSES
    const allTodos = document.getElementsByClassName('todo-item');
    //ATENÇÃO: estava a fazer isto com .querySelectiorAll(), mas retorna uma NodeList ESTÁTICA !!, ou seja, quaisquer alterações que sejam feitas posteriormente à sua criação (neste caso, criação de novos TODOs <=> adição de novos HTML elements) não se vão reprecutir no conteúdo da NodeList. Os Nodes da NodeList são os mesmos que eram no momento em que foi criada. Se usasse o .querySelectorAll(), não ia ter todos
    
    //-- DISPLAYING THE RIGHT TODOS
    Array.from(todoItemsInfoS).forEach(todoItemsInfo => todoItemsInfo.addEventListener('click', (eventObject) => {
        
        Array.from(allTodos).forEach(divTodoItem => {
            switch(eventObject.target.innerText){
                case 'All':
                    divTodoItem.style.display = 'flex';
                    break;
                case 'Active':
                    if(!divTodoItem.classList.contains('active')){
                        divTodoItem.style.display = 'none';
                    }else{
                        divTodoItem.style.display = 'flex';
                    }
                    break;
                case 'Completed':
                    if(divTodoItem.classList.contains('active')){
                        divTodoItem.style.display = 'none';
                    }else{
                        divTodoItem.style.display = 'flex';
                    }
                    break;
                case 'Clear Completed':
                    if(!divTodoItem.classList.contains('active')){
                        divTodoItem.remove();
                        removeFromLocalStorage(divTodoItem.children[1].innerText);
                    }
                    break;
                default:
                    return;
            };
        });
    }));

    //--TOGGLING THE ACTIVESTATE CLASS BETWEEN ITEM STATUSES SPANS
    const spanStatuses = document.getElementsByTagName('span');
    //fiz .slice(1) para retirar o primeiro span tag do array, pq é o span cujo o innerText corresponde ao número de items left e não quero que ele seja clicável/mude para azul
    Array.from(spanStatuses).slice(1).forEach(span => span.addEventListener('click', () => {
        //qd clico num dos spans, a class="active" é removida dos outros
        Array.from(spanStatuses).forEach(span => {
            span.classList.remove('activeState');
        });
        //e adicionada ao clicado, i.e., fica azul
        span.classList.add('activeState');
    }));
    
    //THEME
    const body = document.querySelector('body');
    const icon = document.querySelector('#icon-id');

    //ATENÇÃO: tinha feito assim, mas vou usar imagens diferentes consoante a width do dispositivo. Ver linha 46 da CSS style sheet
    /*
    const backgroundImg = document.querySelector('.background img');

    icon.addEventListener('click', () => {
        body.classList.toggle('light-theme');
        if(body.classList.contains('light-theme')){
            backgroundImg.setAttribute('src', 'images/bg-desktop-light.jpg');
            icon.setAttribute('src','images/icon-moon.svg');
        }else{
            backgroundImg.setAttribute('src', 'images/bg-desktop-dark.jpg');
            icon.setAttribute('src','images/icon-sun.svg');
        };
    });
    */

    const background = document.querySelector('.background');
    const mediaQueryList = window.matchMedia("(max-width: 480px)");
    //console.log(mediaQueryList);

    icon.addEventListener('click', () => {
        body.classList.toggle('light-theme');
        if(body.classList.contains('light-theme')){

            //se a matches property da mediaQueryList tem o valor true, então o user abriu a app num dispositivo com max-width = 480px e, portanto, a imagem de fundo apresentada será a versão mais pequena, pq estamos em mobile. Se não, carrega a imagem maior
            mediaQueryList.matches ? background.style.backgroundImage = 'url(images/bg-mobile-light.jpg)' : background.style.backgroundImage = 'url(images/bg-desktop-light.jpg)';
            
            icon.setAttribute('src','images/icon-moon.svg');

        }else{

            mediaQueryList.matches ? background.style.backgroundImage = 'url(images/bg-mobile-dark.jpg)' : background.style.backgroundImage = 'url(images/bg-desktop-dark.jpg)';

            icon.setAttribute('src','images/icon-sun.svg');
        };
    });

    //A App está completamente funcional, porém, vou guardar os todos no local storage

    //LOCAL STORAGE
    function localStorage(todoText){ //todoValue = input.value (ver função addTodos)
        let todosArray;
        //se não existirem dados no armazenamento local
        if(window.localStorage.getItem('todos') === null){
            //window.localStorage.getItem(key) {todos: }
            todosArray = []; //quando fizer setItem, o localStorage vai ficar assim {todos: []}
        }else{ //se existirem, guardar no array todos
            todosArray = JSON.parse(window.localStorage.getItem('todos')); //JSON.parse(JSON String) -> JS object (Object, Array, ...)
        }
        todosArray.push(todoText); //adicona o todo ao array de todos
        window.localStorage.setItem('todos', JSON.stringify(todosArray)); //adiciona o array ao local storage {todos: [todoText, todoText, ..., todoText]}
    };

    /*
    PROBLEMA ATUAL 1: se atualizarmos a página/abrirmos outra sessão, os todos da sessão anterior aparecem no localStorage, mas não são displayed.
    SOLUÇÃO 1: getLastSessionTodos()

    PROBLEMA ATUAL 2: conforme o código está escrito, se eliminarmos um todo, ele continua a aparecer no localStorage. Apenas o display é alterado.
    SOLUÇÃO 2: removeFromLocalStorage()
    */
     
    function getLastSessionTodos(){
        let todosArray;
        if(window.localStorage.getItem('todos') === null){
            todosArray = [];
        }else{
            todosArray = JSON.parse(window.localStorage.getItem('todos'));
        };

        todosArray.forEach(todoText => {
            //Podia ter feito igual ao que fiz na função addTodo, com a diferença de que agora divTodoText.innerText = todoText; (vou buscá-lo ao local storage), mas vou fazer de uma forma alternativa, muito mais simplificada, para efeitos de prática

            todoItemsDiv.innerHTML += `
            <div class="todo-item active">
                    <div class="check">
                        <div class="check-mark">
                            <img src="images/icon-check.svg" alt="icon-check" style="visibility: hidden">
                        </div>
                    </div>

                    <div class="todo-text">`
                    + todoText + `
                    </div>

                    <div class="delete-img">
                        <img src="images/icon-cross.svg" alt="icon-delete" class="delete">
                    </div>
                </div>
            `;

            itemsLeft.innerHTML = +itemsLeft.innerHTML + 1;
        });
    };

    getLastSessionTodos();

    function removeFromLocalStorage(todoText){
        let todosArray;
        if(window.localStorage.getItem('todos') === null){
            todosArray = [];
        }else{
            todosArray = JSON.parse(window.localStorage.getItem('todos'));
        };

        todosArray.splice(todosArray.indexOf(todoText), 1);
        //atualiza o local storage, sem esse elemento
        window.localStorage.setItem('todos', JSON.stringify(todosArray));
    };

    //window.localStorage.clear();
});