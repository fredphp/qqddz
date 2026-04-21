package com.sun.mail.dsn;

import com.sun.mail.util.LineOutputStream;
import java.io.EOFException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintStream;
import java.util.Enumeration;
import java.util.Vector;
import javax.mail.MessagingException;
import javax.mail.internet.InternetHeaders;

public class DeliveryStatus
{
  private static boolean debug = false;
  protected InternetHeaders messageDSN;
  protected InternetHeaders[] recipientDSN;

  static
  {
    try
    {
      String str = System.getProperty("mail.dsn.debug");
      boolean bool1 = false;
      if (str != null)
      {
        boolean bool2 = str.equalsIgnoreCase("false");
        bool1 = false;
        if (!bool2)
          bool1 = true;
      }
      debug = bool1;
      return;
    }
    catch (SecurityException localSecurityException)
    {
    }
  }

  public DeliveryStatus()
    throws MessagingException
  {
    this.messageDSN = new InternetHeaders();
    this.recipientDSN = new InternetHeaders[0];
  }

  public DeliveryStatus(InputStream paramInputStream)
    throws MessagingException, IOException
  {
    this.messageDSN = new InternetHeaders(paramInputStream);
    if (debug)
      System.out.println("DSN: got messageDSN");
    Vector localVector = new Vector();
    try
    {
      while (true)
      {
        int i = paramInputStream.available();
        if (i <= 0)
        {
          if (debug)
            System.out.println("DSN: recipientDSN size " + localVector.size());
          this.recipientDSN = new InternetHeaders[localVector.size()];
          localVector.copyInto(this.recipientDSN);
          return;
        }
        InternetHeaders localInternetHeaders = new InternetHeaders(paramInputStream);
        if (debug)
          System.out.println("DSN: got recipientDSN");
        localVector.addElement(localInternetHeaders);
      }
    }
    catch (EOFException localEOFException)
    {
      while (true)
        if (debug)
          System.out.println("DSN: got EOFException");
    }
  }

  private static void writeInternetHeaders(InternetHeaders paramInternetHeaders, LineOutputStream paramLineOutputStream)
    throws IOException
  {
    Enumeration localEnumeration = paramInternetHeaders.getAllHeaderLines();
    try
    {
      while (true)
      {
        if (!localEnumeration.hasMoreElements())
          return;
        paramLineOutputStream.writeln((String)localEnumeration.nextElement());
      }
    }
    catch (MessagingException localMessagingException)
    {
      Exception localException = localMessagingException.getNextException();
      if ((localException instanceof IOException))
        throw ((IOException)localException);
      throw new IOException("Exception writing headers: " + localMessagingException);
    }
  }

  public void addRecipientDSN(InternetHeaders paramInternetHeaders)
  {
    InternetHeaders[] arrayOfInternetHeaders = new InternetHeaders[1 + this.recipientDSN.length];
    System.arraycopy(this.recipientDSN, 0, arrayOfInternetHeaders, 0, this.recipientDSN.length);
    this.recipientDSN = arrayOfInternetHeaders;
    this.recipientDSN[(-1 + this.recipientDSN.length)] = paramInternetHeaders;
  }

  public InternetHeaders getMessageDSN()
  {
    return this.messageDSN;
  }

  public InternetHeaders getRecipientDSN(int paramInt)
  {
    return this.recipientDSN[paramInt];
  }

  public int getRecipientDSNCount()
  {
    return this.recipientDSN.length;
  }

  public void setMessageDSN(InternetHeaders paramInternetHeaders)
  {
    this.messageDSN = paramInternetHeaders;
  }

  public String toString()
  {
    return "DeliveryStatus: Reporting-MTA=" + this.messageDSN.getHeader("Reporting-MTA", null) + ", #Recipients=" + this.recipientDSN.length;
  }

  public void writeTo(OutputStream paramOutputStream)
    throws IOException, MessagingException
  {
    LineOutputStream localLineOutputStream;
    if ((paramOutputStream instanceof LineOutputStream))
    {
      localLineOutputStream = (LineOutputStream)paramOutputStream;
      writeInternetHeaders(this.messageDSN, localLineOutputStream);
      localLineOutputStream.writeln();
    }
    for (int i = 0; ; i++)
    {
      if (i >= this.recipientDSN.length)
      {
        return;
        localLineOutputStream = new LineOutputStream(paramOutputStream);
        break;
      }
      writeInternetHeaders(this.recipientDSN[i], localLineOutputStream);
      localLineOutputStream.writeln();
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.dsn.DeliveryStatus
 * JD-Core Version:    0.6.2
 */