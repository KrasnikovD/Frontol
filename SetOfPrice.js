function init()
{
frontol.addEventListener("addPosition", "SetMinPrice", false);
frontol.addEventListener("changePosition", "SetMinPrice", false);

OPT_12 = 12;
OPT_2 = 2;

}
//Проверка классификатора с кодом "1" => Минимальная цена от 12 шт
function IsWareGroup1(Ware){
  for (
         Ware.classifier.index = 1;
         Ware.classifier.index <= Ware.classifier.count;
         Ware.classifier.index++)
  {
         if (Ware.classifier.code == 1){
         //frontol.actions.showMessage("Код классификатора " + Ware.classifier.index);
         return true;
         }
  }
  return false;
  }

//Проверка классификатора с кодом "2" => Минимальная цена от 2 шт
function IsWareGroup2(Ware){
  for (
         Ware.classifier.index = 1;
         Ware.classifier.index <= Ware.classifier.count;
         Ware.classifier.index++)
  {
         if (Ware.classifier.code == 2){
         return true;
         }
  }
  return false;
  }


function SetMinPrice(){

FD = frontol.currentDocument;

for (
       FD.position.index = 1;
       FD.position.index <= FD.position.count;
       FD.position.index++){
//FD.position.ware.minPrice  - минимальная цена
//FD.position.setPric - метод установить цену
//FD.position.totalSu - итоговая цена позиции цена * кол-во

        if (FD.position.quantity >= OPT_12 && IsWareGroup1(FD.position.ware)){
            FD.position.setPrice = FD.position.ware.minPrice;
        } else
          if (FD.position.quantity >= OPT_2 && IsWareGroup2(FD.position.ware)){
              FD.position.setPrice = FD.position.ware.minPrice;
          }  else {
          FD.position.setPrice = FD.position.ware.price;
        }







//       if (FD.position.quantity >= 12 && IsWareGroup1(FD.position.ware)){
//          frontol.actions.showMessage("minPrice " + FD.position.ware.minPrice);
//          FD.position.setPrice = FD.position.ware.minPrice;
//       } else {
//         FD.position.setPrice = FD.position.ware.price;
//         }
//       if (FD.position.quantity >= 2 && IsWareGroup2(FD.position.ware)){
//          FD.position.setPrice = FD.position.ware.minPrice;
//       } else {
 //        FD.position.setPrice = FD.position.ware.price;
//         }
//       frontol.actions.showMessage("Кол-во зарегистрированных позиций " + FD.position.quantity);
//       frontol.actions.showMessage("Минимальная цена " + FD.position.ware.minPrice);
//
//       if (IsWareGroup1(FD.position.ware)){
//          frontol.actions.showMessage("!!! ");
}


//frontol.actions.showMessage("summPotratsAdd "+summPotratsAdd)
}
