package com.sun.mail.handlers;

import javax.activation.ActivationDataFlavor;

public class text_html extends text_plain
{
  private static ActivationDataFlavor myDF = new ActivationDataFlavor(String.class, "text/html", "HTML String");

  protected ActivationDataFlavor getDF()
  {
    return myDF;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.handlers.text_html
 * JD-Core Version:    0.6.2
 */