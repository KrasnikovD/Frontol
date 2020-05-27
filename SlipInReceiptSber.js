  for(frontol.currentDocument.payment.index = 1;
      frontol.currentDocument.payment.index <=
      frontol.currentDocument.payment.count;
      frontol.currentDocument.payment.index++)
  {
    // печатаем слип внутри чека+++
    if (frontol.currentDocument.payment.type.code == 4)
    {
        print.printLRStringLF("-","-","-");
        print.printCenterString ("БАНКОВСКИЕ ОПЛАТЫ"," ");
        print.printLRStringLF("-","-","-");
        Stream = new ActiveXObject("ADODB.Stream");
        FileSbrf = "C:\\sc552\\p";
        Stream.Open();
        Stream.Type = 2;
        Stream.CharSet = "CP866"
        Stream.LoadFromFile(FileSbrf);
        Count = 0;
        Pay_date_time = "";
        Pay_type = "";
        Summ = "";
        Auth = "";
        //frontol.actions.showMessage("Мы тут были");
        while (!Stream.EOS)
        {
          Count = Count + 1;
          buff = Stream.ReadText(-2);
          if (Count == 6)
          {
            buff = buff.replace(/\s+/g,' ');
            Pay_date_time = buff;
          }
          else if(Count == 8)
          {
            buff = buff.replace(/\s+/g,'');
            Pay_type = buff;
            print.printLRStringLF("Чек: " + Pay_type, Pay_date_time," ");
          }
          else if((Count > 8 & Count < 15) || (Count == 18) || (Count == 22) || (Count == 23) || (Count == 28))
          {
            print.printStringWordWrap (buff);
          }
          else if(Count == 16)
          {
            buff = buff.replace(/\s+/g,' ');
            Summ = buff;
          }
          else if(Count == 17)
          {
            buff = buff.replace(/\s+/g,' ');
            Summ = Summ + " " + buff;
            print.printStringWordWrap (Summ);
          }
          else if(Count == 19)
          {
            buff = buff.replace(/\s+/g,'');
            Auth = buff;
          }
          else if(Count == 20)
          {
            buff = buff.replace(/\s+/g, ' ');
            Auth = Auth + " " + buff;
            print.printStringWordWrap (Auth);
          }
        }
        Stream.Close();
        print.printLRStringLF("-","-","-");
    }
    // печатаем слип внутри чека---

    if(frontol.currentDocument.payment.sumInBaseCurrency > 0)
      print.printLRString("  "+frontol.currentDocument.payment.type.text,
                       "="+print.formatCurrency(frontol.currentDocument.payment.sumInBaseCurrency),"_");
    else
    {
      print.printStringWordWrap("Сдача");
      print.printLRString("  "+frontol.currentDocument.payment.type.text,
                       "="+print.formatCurrency(-frontol.currentDocument.payment.sumInBaseCurrency),"_");
    }
  }
