package com.sun.mail.iap;

import java.io.IOException;
import java.io.OutputStream;

public abstract interface Literal
{
  public abstract int size();

  public abstract void writeTo(OutputStream paramOutputStream)
    throws IOException;
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.iap.Literal
 * JD-Core Version:    0.6.2
 */