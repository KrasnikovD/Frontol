//AG_1.0.11.1
//GuestId    = ""; //7440963;//frontol.currentDocument.cardValues;
//HolderName = "";
//BonusCode  = -1;
//bonusAG      = "";
//BonusBalance = "";
//summ       = -1;
//DocNum     = -1;//frontol.currentDocument.number;
//DocDate    = "01.01.2001"; //frontol.currentDocument.date.Close;
//summBonusPay = 0; // ����� ������ �������� ����� ��� ����������
//summBonusAdd = 0; // ����� ���������� ������� ����� ��� ����������


function init() {
    frontol.addEventListener("addCard", "AfterAddCard", false);
    frontol.addEventListener("addCard", "ClearUserValues", true);
    frontol.addEventListener("cancelCard", "ClearUserValues", false);
    frontol.addEventListener("closeDocument", "PostPaymend", false);
    frontol.addEventListener("cancelDocument", "ClearUserValues", false);
    frontol.addEventListener("openDocument", "ClearUserValues", true);

    frontol.addEventListener("addPosition", "SetOptPrice", false);
    frontol.addEventListener("changePosition", "SetOptPrice", false);


    frontol.userValues.clear();

    SRV_LINK = "77.243.12.170:60606";
    CARD_FOUND = false;
    SET_TIME_WAIT = "5";
    ERROR_CONNECT = true;

    OPT_12 = 12;
    OPT_2 = 2;

}
//�������� �������������� � ����� "1" => ����������� ���� �� 12 ��
function IsWareGroup1(Ware) {
    for (
        Ware.classifier.index = 1; Ware.classifier.index <= Ware.classifier.count; Ware.classifier.index++) {
        if (Ware.classifier.code == 1) {
            //frontol.actions.showMessage("��� �������������� " + Ware.classifier.index);
            return true;
        }
    }
    return false;
}

//�������� �������������� � ����� "2" => ����������� ���� �� 2 ��
function IsWareGroup2(Ware) {
    for (
        Ware.classifier.index = 1; Ware.classifier.index <= Ware.classifier.count; Ware.classifier.index++) {
        if (Ware.classifier.code == 2) {
            return true;
        }
    }
    return false;
}

//������� ���������������� ���������� ����� ������ ���������
function ClearUserValues() {
    frontol.userValues.clear();
    CARD_FOUND = false;
}

////////////////////////////////////////////////////////////////////////////
//������������� ����������� ���� ��� ���������� ������ ���� ������� �����///
////////////////////////////////////////////////////////////////////////////
// function changeMinPrice() {
// SummPromo = 0;
// FD = frontol.currentDocument;
//    if(FD.cardValues != 0){
//       SetMinPrice(); //������������� ��������� �����
//    }
// }
/////////////////////////////////////////////////////////////////
//� ����������� ���������������� ��������������� ������� ���� ///
/////////////////////////////////////////////////////////////////
function SetOptPrice() {

    FD = frontol.currentDocument;
    if (FD.cardValues == '') {
        for (
            FD.position.index = 1; FD.position.index <= FD.position.count; FD.position.index++) {
            //FD.position.ware.minPrice  - ����������� ����
            //FD.position.setPric - ����� ���������� ����
            //FD.position.totalSu - �������� ���� ������� ���� * ���-��

            if (FD.position.quantity >= OPT_12 && IsWareGroup1(FD.position.ware)) {
                FD.position.setPrice = FD.position.ware.minPrice;
            } else
            if (FD.position.quantity >= OPT_2 && IsWareGroup2(FD.position.ware)) {
                FD.position.setPrice = FD.position.ware.minPrice;
            } else {
                FD.position.setPrice = FD.position.ware.price;
            }
        }
    }
}
////////////////////////////////////////////////////////////
//���� ������� ����� ������������ ����������� ���� ������///
////////////////////////////////////////////////////////////
function SetMinPrice() {

    FD = frontol.currentDocument;
    summBonusAdd = 0; //C���� ������� � ����������
    summPotratsAdd = 0; //C���� ������ � ����������
    SummPromo = 0; //����� ���������� ������
    SummOpt = 0;
    SummChek = 0; // ����� ����
    SummPositionDiscountOff = 0; //����� ������� ��� ��������


    // frontol.actions.showMessage("summBonusAdd:" + summBonusAdd);
    // frontol.actions.showMessage("summPotratsAdd:" + summPotratsAdd);
    // frontol.actions.showMessage("SummPromo:" + SummPromo);
    // frontol.actions.showMessage("SummChek:" + SummChek);
    // frontol.actions.showMessage("SummPositionDiscountOff:" + SummPositionDiscountOff);

    for (
        FD.position.index = 1; FD.position.index <= FD.position.count; FD.position.index++) {
        if (IsWareGroup1(FD.position.ware) || IsWareGroup2(FD.position.ware)) {
            SummOpt += FD.position.totalSum;
            SummChek += FD.position.totalSum;
            //frontol.actions.showMessage("SummPositionDiscountOff:" + SummPositionDiscountOff);
        } else {
            //FD.position.ware.minPrice  - ����������� ����
            //FD.position.setPric - ����� ���������� ����
            //FD.position.totalSu - �������� ���� ������� ���� * ���-��
            if (FD.position.ware.maxDiscount == 0)
                SummPositionDiscountOff += FD.position.totalSum;
                //frontol.actions.showMessage("SummPositionDiscountOff:" + SummPositionDiscountOff);
            //frontol.actions.showMessage("��������� ������ c �������������:" + SummPositionDiscountOff);


            if (FD.position.ware.minPrice == 0){
                SummChek += FD.position.totalSum;
                //frontol.actions.showMessage("SummChek:" + SummChek);
            }
            else {
                FD.position.setPrice = FD.position.ware.minPrice;
                SummPromo += FD.position.totalSum;
                //frontol.actions.showMessage("SummPromo:" + SummPromo);
                SummChek += FD.position.totalSum;
                //frontol.actions.showMessage("SummChek:" + SummChek);
                //frontol.actions.showMessage("��������� ������ �� �����:" + SummPromo);
            }
        }
    }

    summPotratsAdd = Math.ceil(SummChek - (SummPromo + SummPositionDiscountOff+SummOpt));
    summBonusAdd = Math.ceil((summPotratsAdd / 100 * BonusCode.text));

    if (frontol.currentDocument.totalSum != 0) {
        WShell = new ActiveXObject("WScript.Shell");
        WShell.SendKeys("{F11}");
    }
    //frontol.actions.showMessage("summPotratsAdd "+summPotratsAdd)
}

////////////////////////
///������ ������� � AG///
////////////////////////
function parseWitoutActiveX(str) {
    var doc = null;
    var xmlIsland = document.createElement('xml');

    if (xmlIsland) {
        xmlIsland.setAttribute('id', 'xmlActiveXGetRid');
        xmlIsland.innerHTML = str;
        document.body.appendChild(xmlIsland);
        var doc = xmlIsland.XMLDocument;
        document.body.removeChild(xmlIsland);
        return doc;
    }
}


///////////////////////////////////////////////////
//������� ������� ������ ��� ������������� ������//
///////////////////////////////////////////////////

function AfterAddCard() {
    //frontol.actions.showMessage("1 " + CARD_FOUND);
    FD = frontol.currentDocument;
    //frontol.actions.showMessage(FD.hallPlaceCode);
    ERROR_CONNECT = true;

    //������������� ��������� �����
    //��� ���������� ����� � ���,
    //��������������� ����������� ����,
    //���� ��� ������� � ������.
    //������ ������ � ��������)


    GetCardByCode();

    if (!ERROR_CONNECT) {
        WShell = new ActiveXObject("WScript.Shell");
        WShell.SendKeys("^{F12}");
        WShell.SendKeys("^{F6}");

    } else {

        //frontol.actions.wait("��������� ������...", SET_TIME_WAIT);

        if (ERROR_CONNECT = true && GuestId != null) {

            SetMinPrice();

        } else {
            frontol.actions.showMessage("����� � �������: " + FD.cardValues + " ����� �� �������!!!");
            WShell = new ActiveXObject("WScript.Shell");
            WShell.SendKeys("^{F12}");
            WShell.SendKeys("^{F6}");
        }
    }
}
//////////////////////////////////////////////
//�������� �������
//////////////////////////////////////////////
function PostPaymend() {

    //���� ���������
    DocDate = frontol.currentDocument.dateClose;
    FD = frontol.currentDocument;
    //���� ����� �������
    if (FD.cardValues != '') {
        //frontol.actions.showMessage("summPotratsAdd: " + summPotratsAdd);
        //frontol.actions.showMessage("FD.totalSumDiscount: " + FD.totalSumDiscount);

        //���� ���� ������ � ����� �� AG � ���� ������ ����������� � ���� �������
        //����������� ������ � ������� BonusPay/frontol.actions.showMessage("FD.totalSumDiscount " + FD.totalSumDiscount);
        if (GuestId.text.length > 0 && BonusPay > 0) {

            //������ � AG
            var xhttp = new ActiveXObject("Microsoft.XMLHTTP");
            xhttp.open("GET", "http://" + SRV_LINK + "/cgi-bin/agxmlapi" + frontol.shopNumber + "/agxmlapi.exe/" +
                "Transaction" +
                "?acc=" + GuestId.text +
                "&sum=-" + (BonusPay * 100) +
                "&kind=2" +
                "&unit=1" +
                "&check=" + FD.number +
                "&date=" + DocDate + //DateToString(DocDate)+ //"16.05.2019"+//DocDate+
                "&rest=1", false);

            xhttp.onreadystatechange = function () {

                if (xhttp.readyState == 4 && xhttp.status == 200) {
                    var xmlDoc = new ActiveXObject("Msxml2.DOMDocument.6.0");
                    var res;
                    xmlDoc.async = false;
                    xmlDoc.loadXML(xhttp.responseText);
                    if (xmlDoc.parseError.errorCode != 0) {
                        var myErr = xmlDoc.parseError;
                        frontol.actions.showMessage("You have error " + myErr.reason);
                    } else {
                        xmlDoc.setProperty("SelectionLanguage", "XPath");
                        //frontol.actions.showMessage(result.text);
                    }
                    var xdoc = parseWitoutActiveX(xhttp.responseText);
                    BonusPay
                    //frontol.actions.showMessage(xdoc.xml);
                }

            };
            xhttp.send();
            ClearUserValues(); //������� ������ �������

        } else {
            ///////////////////////////////////////////////////////////
            //���� �������� ������� ��� �� ���������� ������� � ������
            //� ����������� �� ����������� codeBonuse
            ///////////////////////////////////////////////////////
            //frontol.actions.showMessage("GuestId.text.length " + GuestId.text.length + "\n" + "summPotratsAdd " + summPotratsAdd);
            if (GuestId.text.length > 0) {
                //������ � AG
                var xhttp = new ActiveXObject("Microsoft.XMLHTTP");
                xhttp.open("GET", "http://" + SRV_LINK + "/cgi-bin/agxmlapi" + frontol.shopNumber + "/agxmlapi.exe/" +
                    "Transaction" +
                    "?acc=" + GuestId.text +
                    "&sum=" + (summPotratsAdd * 100) +
                    "&kind=3" +
                    "&unit=1" +
                    "&check=" + FD.number +
                    "&date=" + DocDate + //DateToString(DocDate)+ //"16.05.2019"+//DocDate+
                    "&rest=1", false);

                xhttp.onreadystatechange = function () {

                    if (xhttp.readyState == 4 && xhttp.status == 200) {
                        var xmlDoc = new ActiveXObject("Msxml2.DOMDocument.6.0");
                        var res;
                        xmlDoc.async = false;
                        xmlDoc.loadXML(xhttp.responseText);
                        if (xmlDoc.parseError.errorCode != 0) {
                            var myErr = xmlDoc.parseError;
                            frontol.actions.showMessage("You have error PotratsAdd " + myErr.reason);
                        } else {
                            xmlDoc.setProperty("SelectionLanguage", "XPath");
                        }
                        var xdoc = parseWitoutActiveX(xhttp.responseText);
                    }

                };
                xhttp.send();
                ///////////////////////////////////////////////////////////////////////
                //���������� ������
                //C���� ������ (������� ������� �������� ����� �����)
                //��� ����� �������� ������������� ��������� � ����� ���������� 3
                ///////////////////////////////////////////////////////////////////////
            };


            ///////////////////////////////////////////
            //���������� ������� �� ����
            //C���� �������� ��� ���������� ������
            //�� ���������� ����� ���������� 2
            //////////////////////////////////////////

            if (GuestId.text.length > 0) {

                var xhttp = new ActiveXObject("Microsoft.XMLHTTP");
                xhttp.open("GET", "http://" + SRV_LINK + "/cgi-bin/agxmlapi" + frontol.shopNumber + "/agxmlapi.exe/" +
                    "Transaction" +
                    "?acc=" + GuestId.text +
                    "&sum=" + (summBonusAdd * 100) +
                    "&kind=2" +
                    "&unit=1" +
                    "&check=" + FD.number +
                    "&date=" + DocDate + //DateToString(DocDate)+ //"16.05.2019"+//DocDate+
                    "&rest=1", false);

                xhttp.onreadystatechange = function () {

                    if (xhttp.readyState == 4 && xhttp.status == 200) {
                        var xmlDoc = new ActiveXObject("Msxml2.DOMDocument.6.0");
                        var res;
                        xmlDoc.async = false;
                        xmlDoc.loadXML(xhttp.responseText);
                        if (xmlDoc.parseError.errorCode != 0) {
                            var myErr = xmlDoc.parseError;
                            frontol.actions.showMessage("You have error BonusAdd " + myErr.reason);
                        } else {
                            xmlDoc.setProperty("SelectionLanguage", "XPath");
                        }
                        var xdoc = parseWitoutActiveX(xhttp.responseText);
                    }

                };
                xhttp.send();

                //frontol.actions.showMessage("��������� �������: "+ (summBonusAdd*100));
                ClearUserValues(); //������� ������ �������

            }
        }
    }
}

////////////////////////////////////////////////////////
///��������� ���-�� ������� ��� ��������////////////////
///////////////////////////////////////////////////////

function SetBonusPaymend() {
    MaxPercentSale = 1; //����������� ������� �������� ������� 100%
    MaxBonusValue = 0; // ����������� ��������� ���-�� ������� ��� ��������
    BonusValue = Math.floor(BonusBalance.text); //������ �� AG
    BonusPay = 0;

    FD = frontol.currentDocument; //������� ��������
    //������������ ���-�� �������(30%) �� ����� ����
    //FD.sum ����� ����
    //SummPromo = 0;
    //SummChek = 0;
    //SummPositionDiscountOff = 0;

    if (SummPromo > 0 || SummPositionDiscountOff > 0) {
        MaxBonusValue = Math.floor(FD.sum - (SummPromo + SummPositionDiscountOff));
        //frontol.actions.showMessage("���-�� ������� ��� �������� 1: "+ MaxBonusValue);
    } else {
        MaxBonusValue = Math.floor(FD.sum * MaxPercentSale);
        //frontol.actions.showMessage("���-�� ������� ��� �������� 2: "+ MaxBonusValue);
    }

    //frontol.actions.showMessage("������������ ��-�� �������: "+MaxBonusValue+" �� ����� ����: "+FD.sum);

    if (BonusValue <= MaxBonusValue) {
        if (frontol.actions.showMessage("������ �����: " + BonusValue + ".\n" + "�������� �������: " + BonusValue, Button.YesNo + Icon.Question) == DialogResult.Yes) {

            summPotratsAdd = 0;
            //frontol.actions.showMessage("�������� 1: "+BonusValue);
            return BonusPay = BonusValue;
            //FD.addPayment(3,BonusValue,2);

        }
    } else if (frontol.actions.showMessage("������ �����: " + BonusValue + ".\n" + "�������� �������: " + MaxBonusValue, Button.YesNo + Icon.Question) == DialogResult.Yes) {

        summPotratsAdd = 0;
        return BonusPay = MaxBonusValue;

    }
}
///////////////////////////////////////////
///�������� ������ ����� �� AG/////////////
///////////////////////////////////////////
function GetCardByCode() {

    FD = frontol.currentDocument;
    //frontol.actions.showMessage(FD.hallPlaceCode);

    //������ � AG

    var xhttp = new ActiveXObject("Microsoft.XMLHTTP");

    xhttp.onreadystatechange = function () {

        if (xhttp.readyState == 4 && xhttp.status == 200) {
            //frontol.actions.showMessage("responseText" + xhttp.responseText);
            var xmlDoc = new ActiveXObject("Msxml2.DOMDocument.6.0");
            var GuestID, HolderName, DiscountCode;
            xmlDoc.async = false;
            xmlDoc.loadXML(xhttp.responseText);
            if (xmlDoc.parseError.errorCode != 0) {
                var myErr = xmlDoc.parseError;
                frontol.actions.showMessage("You have error " + myErr.reason);
            } else {
                xmlDoc.setProperty("SelectionLanguage", "XPath");
                GuestId = xmlDoc.selectSingleNode("//AG4Response//HolderInfo//GuestId");
                HolderName = xmlDoc.selectSingleNode("//AG4Response//HolderInfo//HolderName");
                BonusCode = xmlDoc.selectSingleNode("//AG4Response//HolderInfo//BonusCode");
                BonusBalance = xmlDoc.selectSingleNode("//AG4Response//HolderInfo//S2");

                frontol.userValues.clear();
                frontol.userValues.set("bonusAG", BonusBalance.text); //����������� ���������������� ���������� bonusAG
            }
            var xdoc = parseWitoutActiveX(xhttp.responseText);
        }

    };

    xhttp.open("GET", "http://" + SRV_LINK + "/cgi-bin/agxmlapi" + frontol.shopNumber + "/agxmlapi.exe/HolderByCode?code=" + frontol.currentDocument.cardValues + "&shop=1&pos=2&x=" + Math.random(), false);

    try {
        xhttp.send();
    } catch (e) {

        ERROR_CONNECT = false;
        frontol.actions.showMessage(e.message + "\n" + "�� ������� ������������ � ���������� �������." + "\n" + "�������� ������ �������� ��� ����������� �������� ����������!", Icon.Error);



    }
}
