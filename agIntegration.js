//AG_1.0.11.1
//GuestId    = ""; //7440963;//frontol.currentDocument.cardValues;
//HolderName = "";
//BonusCode  = -1;
//bonusAG      = "";
//BonusBalance = "";
//summ       = -1;
//DocNum     = -1;//frontol.currentDocument.number;
//DocDate    = "01.01.2001"; //frontol.currentDocument.date.Close;
//summBonusPay = 0; // СУММА ОПЛАТЫ БОНУСАМИ НУЖНА ДЛЯ ТРАНЗАКЦИИ
//summBonusAdd = 0; // СУММА ДОБАВЛЕНИЯ БОНУСОВ НУЖНА ДЛЯ ТРАНЗАКЦИИ


function init()
{
frontol.addEventListener("addCard", "AfterAddCard", false);
frontol.addEventListener("addCard", "ClearUserValues", true);
frontol.addEventListener("cancelCard", "ClearUserValues", false);
frontol.addEventListener("closeDocument", "PostPaymend", false);
frontol.addEventListener("addPosition", "changeMinPrice", false);
frontol.addEventListener("cancelDocument", "ClearUserValues", false);
frontol.addEventListener("openDocument", "ClearUserValues", true);

frontol.userValues.clear();

SRV_LINK = "XXX.XXX.XXX.XXX:60606";
CARD_FOUND = false;
SET_TIME_WAIT = "5";
ERROR_CONNECT = true;

}

//Очищает пользовательские переменные после отмены документа
function ClearUserValues(){
frontol.userValues.clear();
CARD_FOUND = false;
}

////////////////////////////////////////////////////////////////////////////
//Пересчитывает минимальную цену при добовлении товара если введена карта///
////////////////////////////////////////////////////////////////////////////
function changeMinPrice() {
SummPromo = 0;
FD = frontol.currentDocument;
   if(FD.cardValues != 0){
      SetMinPrice(); //Пересчитывает акционный товар
   }
}

////////////////////////////////////////////////////////////
//Если введена карта устнавливает минимальную цену товара///
////////////////////////////////////////////////////////////
function SetMinPrice(){

FD = frontol.currentDocument;
summBonusAdd = 0;
summPotratsAdd = 0;
SummPromo = 0;
SummChek = 0;
SummPositionDiscountOff = 0;

for (
       FD.position.index = 1;
       FD.position.index <= FD.position.count;
       FD.position.index++){
//FD.position.ware.minPrice  - минимальная цена
//FD.position.setPric - метод установить цену
//FD.position.totalSu - итоговая цена позиции цена * кол-во
           if (FD.position.ware.maxDiscount == 0)
           SummPositionDiscountOff += FD.position.totalSum;
           //frontol.actions.showMessage("Стоимость товара c ограничениями:" + SummPositionDiscountOff);


           if (FD.position.ware.minPrice == 0)
           SummChek += FD.position.totalSum;
           else {
           FD.position.setPrice = FD.position.ware.minPrice;
           SummPromo += FD.position.totalSum;
           SummChek += FD.position.totalSum;
           //frontol.actions.showMessage("Стоимость товара по акции:" + SummPromo);
           }
        }

summPotratsAdd = Math.ceil(SummChek - (SummPromo+SummPositionDiscountOff));
summBonusAdd = Math.ceil((summPotratsAdd/100*BonusCode.text));

 if (frontol.currentDocument.totalSum != 0){
    WShell = new ActiveXObject("WScript.Shell");
    WShell.SendKeys ("{F11}");
 }
//frontol.actions.showMessage("summPotratsAdd "+summPotratsAdd)
}

////////////////////////
///Парсер запроса к AG///
////////////////////////
function parseWitoutActiveX(str){
  var doc= null;
  var xmlIsland = document.createElement('xml');

    if(xmlIsland){
      xmlIsland.setAttribute('id','xmlActiveXGetRid');
      xmlIsland.innerHTML = str;
      document.body.appendChild(xmlIsland);
      var doc  = xmlIsland.XMLDocument;
      document.body.removeChild(xmlIsland);
    return  doc;
    }
}


///////////////////////////////////////////////////
//Функция выводит баланс при прокатываниии картой//
///////////////////////////////////////////////////

function AfterAddCard(){
//frontol.actions.showMessage("1 " + CARD_FOUND);
FD = frontol.currentDocument;
//frontol.actions.showMessage(FD.hallPlaceCode);
ERROR_CONNECT = true;

//Пересчитывает акционный товар
//При добовлении карты в чек,
//устанавливается минимальная цена,
//если она указана в товаре.
//Желтый ценник в магазине)


 GetCardByCode();

 if(!ERROR_CONNECT){
 WShell = new ActiveXObject("WScript.Shell");
 WShell.SendKeys("^{F12}");

 } else {

 //frontol.actions.wait("Получение данных...", SET_TIME_WAIT);

 if(ERROR_CONNECT = true && GuestId != null){
   SetMinPrice();

 } else {
   frontol.actions.showMessage("Карта с номером: " + FD.cardValues + " карта не найдена!!!");
   WShell = new ActiveXObject("WScript.Shell");
   WShell.SendKeys("^{F12}");
 }
 }
}
 //////////////////////////////////////////////
//Списание бонусов
//////////////////////////////////////////////
function  PostPaymend(){

//Дата документа
DocDate = frontol.currentDocument.dateClose;
FD = frontol.currentDocument;
//Если карта введена
if (FD.cardValues != ''){
frontol.actions.showMessage("summPotratsAdd: " + summPotratsAdd);
frontol.actions.showMessage("FD.totalSumDiscount: " + FD.totalSumDiscount);

//Если есть данные о карте из AG и есть скидка начисленная в счет бонусов
//списываются бонусы в размере BonusPay/frontol.actions.showMessage("FD.totalSumDiscount " + FD.totalSumDiscount);
if (GuestId.text.length > 0 && BonusPay > 0){

    //Запрос к AG
    var xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    xhttp.open("GET", "http://"+SRV_LINK+"/cgi-bin/agxmlapi"+frontol.shopNumber+"/agxmlapi.exe/"+
          "Transaction"+
          "?acc="      + GuestId.text +
          "&sum=-"     +(BonusPay*100)+
          "&kind=2"    +
          "&unit=1"    +
          "&check="    +FD.number +
          "&date="     +DocDate + //DateToString(DocDate)+ //"16.05.2019"+//DocDate+
          "&rest=1"
          , false);

xhttp.onreadystatechange = function() {

    if (xhttp.readyState == 4 && xhttp.status == 200){
        var xmlDoc = new ActiveXObject("Msxml2.DOMDocument.6.0");
        var res;
        xmlDoc.async = false;
        xmlDoc.loadXML(xhttp.responseText);
         if (xmlDoc.parseError.errorCode != 0) {
            var myErr = xmlDoc.parseError;
            frontol.actions.showMessage("You have error " + myErr.reason);
        }
         else {
            xmlDoc.setProperty("SelectionLanguage", "XPath");
            //frontol.actions.showMessage(result.text);
        }
        var xdoc = parseWitoutActiveX(xhttp.responseText); BonusPay
        //frontol.actions.showMessage(xdoc.xml);
    }

};
    xhttp.send();
    ClearUserValues(); //Очистка данных клиента

} else {
///////////////////////////////////////////////////////////
//Если списания бонусов нет то начислятся потраты и бонусы
//В зависимости от коэфициента codeBonuse
///////////////////////////////////////////////////////
frontol.actions.showMessage("GuestId.text.length "+GuestId.text.length+"\n"+"summPotratsAdd "+summPotratsAdd);
if (GuestId.text.length > 0){
//Запрос к AG
var xhttp = new ActiveXObject("Microsoft.XMLHTTP");
xhttp.open("GET", "http://"+SRV_LINK+"/cgi-bin/agxmlapi"+frontol.shopNumber+"/agxmlapi.exe/"+
          "Transaction"+
          "?acc="      +GuestId.text +
          "&sum="      +(summPotratsAdd*100)+
          "&kind=3"    +
          "&unit=1"    +
          "&check="    +FD.number +
          "&date="     +DocDate + //DateToString(DocDate)+ //"16.05.2019"+//DocDate+
          "&rest=1"
          , false);

xhttp.onreadystatechange = function() {

    if (xhttp.readyState == 4 && xhttp.status == 200){
        var xmlDoc = new ActiveXObject("Msxml2.DOMDocument.6.0");
        var res;
        xmlDoc.async = false;
        xmlDoc.loadXML(xhttp.responseText);
         if (xmlDoc.parseError.errorCode != 0) {
            var myErr = xmlDoc.parseError;
            frontol.actions.showMessage("You have error PotratsAdd " + myErr.reason);
        }
         else {
            xmlDoc.setProperty("SelectionLanguage", "XPath");
        }
        var xdoc = parseWitoutActiveX(xhttp.responseText);
    }

};
    xhttp.send();
///////////////////////////////////////////////////////////////////////
//Начисление потрат
//Cумма потрат (сколько человек заплатил своих денег)
//Эту сумму передать положительным значением с типом транзакции 3
///////////////////////////////////////////////////////////////////////
};


///////////////////////////////////////////
//Начисление бонусов на счет
//Cумма списания или начисления бонуса
//Ее передавать типом транзакции 2
//////////////////////////////////////////

if (GuestId.text.length > 0) {

var xhttp = new ActiveXObject("Microsoft.XMLHTTP");
xhttp.open("GET", "http://"+SRV_LINK+"/cgi-bin/agxmlapi"+frontol.shopNumber+"/agxmlapi.exe/"+
          "Transaction"+
          "?acc="      +GuestId.text +
          "&sum="      +(summBonusAdd*100)+
          "&kind=2"    +
          "&unit=1"     +
          "&check="    +FD.number +
          "&date="     +DocDate + //DateToString(DocDate)+ //"16.05.2019"+//DocDate+
          "&rest=1"
          , false);

          xhttp.onreadystatechange = function() {

    if (xhttp.readyState == 4 && xhttp.status == 200){
        var xmlDoc = new ActiveXObject("Msxml2.DOMDocument.6.0");
        var res;
        xmlDoc.async = false;
        xmlDoc.loadXML(xhttp.responseText);
         if (xmlDoc.parseError.errorCode != 0) {
            var myErr = xmlDoc.parseError;
            frontol.actions.showMessage("You have error BonusAdd " + myErr.reason);
        }
         else {
            xmlDoc.setProperty("SelectionLanguage", "XPath");
        }
        var xdoc = parseWitoutActiveX(xhttp.responseText);
    }

};
         xhttp.send();

     //frontol.actions.showMessage("Начислено бонусов: "+ (summBonusAdd*100));
     ClearUserValues(); //Очистка данных клиента

  }
 }
}
}

////////////////////////////////////////////////////////
///Вычисляет кол-во бонусов для списания////////////////
///////////////////////////////////////////////////////

function SetBonusPaymend(){
MaxPercentSale = 1; //Максимальнй процент списания бонусов 30%
MaxBonusValue = 0; // Максимально возвожное кол-во бонусов для списания
BonusValue = Math.floor(BonusBalance.text); //Данные из AG
BonusPay = 0;

FD = frontol.currentDocument; //Текущий документ
//Максимальное кол-во бонусов(30%) от суммы чека
//FD.sum Сумма чека
//SummPromo = 0;
//SummChek = 0;
//SummPositionDiscountOff = 0;

if (SummPromo > 0 || SummPositionDiscountOff > 0 ){
   MaxBonusValue = Math.floor(FD.sum - (SummPromo + SummPositionDiscountOff));
   //frontol.actions.showMessage("кол-во бонусов для списания 1: "+ MaxBonusValue);
}
else{
      MaxBonusValue = Math.floor(FD.sum * MaxPercentSale);
      //frontol.actions.showMessage("кол-во бонусов для списания 2: "+ MaxBonusValue);
}

//frontol.actions.showMessage("Максимальное ко-во бонусов: "+MaxBonusValue+" от суммы чека: "+FD.sum);

     if(BonusValue <= MaxBonusValue){
            if(frontol.actions.showMessage("Баланс карты: " + BonusValue + ".\n"+"Возможно списать: "+ BonusValue ,Button.YesNo + Icon.Question) == DialogResult.Yes){

             summPotratsAdd = 0;
             //frontol.actions.showMessage("Спишется 1: "+BonusValue);
             return BonusPay = BonusValue;
             //FD.addPayment(3,BonusValue,2);

        }
     }
       else if(frontol.actions.showMessage("Баланс карты: " + BonusValue + ".\n"+"Возможно списать: "+ MaxBonusValue,Button.YesNo + Icon.Question) == DialogResult.Yes){

             summPotratsAdd = 0;
             return BonusPay = MaxBonusValue;

       }
}
///////////////////////////////////////////
///Получает данные карты из AG/////////////
///////////////////////////////////////////
function GetCardByCode(){

FD = frontol.currentDocument;
//frontol.actions.showMessage(FD.hallPlaceCode);

//Запрос к AG

    var xhttp = new ActiveXObject("Microsoft.XMLHTTP");

    xhttp.onreadystatechange = function() {

    if (xhttp.readyState == 4 && xhttp.status == 200){
        //frontol.actions.showMessage("responseText" + xhttp.responseText);
        var xmlDoc = new ActiveXObject("Msxml2.DOMDocument.6.0");
        var GuestID,HolderName,DiscountCode;
        xmlDoc.async = false;
        xmlDoc.loadXML(xhttp.responseText);
         if (xmlDoc.parseError.errorCode != 0) {
            var myErr = xmlDoc.parseError;
            frontol.actions.showMessage("You have error " + myErr.reason);
        }
         else {
            xmlDoc.setProperty("SelectionLanguage", "XPath");
            GuestId      = xmlDoc.selectSingleNode("//AG4Response//HolderInfo//GuestId");
            HolderName   = xmlDoc.selectSingleNode("//AG4Response//HolderInfo//HolderName");
            BonusCode    = xmlDoc.selectSingleNode("//AG4Response//HolderInfo//BonusCode");
            BonusBalance = xmlDoc.selectSingleNode("//AG4Response//HolderInfo//S2");

        frontol.userValues.clear();
        frontol.userValues.set("bonusAG",BonusBalance.text);  //присваиваем пользовательскую переменную bonusAG
        }
        var xdoc = parseWitoutActiveX(xhttp.responseText);
    }

};

    xhttp.open("GET", "http://"+SRV_LINK+"/cgi-bin/agxmlapi"+frontol.shopNumber+"/agxmlapi.exe/HolderByCode?code="+frontol.currentDocument.cardValues+"&shop=1&pos=2&x="+Math.random(), false);

 try {
    xhttp.send();
 } catch(e) {

  ERROR_CONNECT = false;
  frontol.actions.showMessage(e.message+"\n"+"Не удалось подключиться к Дисконтной системе."+"\n"+ "Возможно сервер отключен или отсутствует интернет соединение!", Icon.Error);



 }
}



