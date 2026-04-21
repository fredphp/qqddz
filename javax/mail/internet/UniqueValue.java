package javax.mail.internet;

import javax.mail.Session;

class UniqueValue
{
  private static int id = 0;

  public static String getUniqueBoundaryValue()
  {
    StringBuffer localStringBuffer = new StringBuffer();
    localStringBuffer.append("----=_Part_").append(getUniqueId()).append("_").append(localStringBuffer.hashCode()).append('.').append(System.currentTimeMillis());
    return localStringBuffer.toString();
  }

  private static int getUniqueId()
  {
    try
    {
      int i = id;
      id = i + 1;
      return i;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public static String getUniqueMessageIDValue(Session paramSession)
  {
    InternetAddress localInternetAddress = InternetAddress.getLocalAddress(paramSession);
    if (localInternetAddress != null);
    for (String str = localInternetAddress.getAddress(); ; str = "javamailuser@localhost")
    {
      StringBuffer localStringBuffer = new StringBuffer();
      localStringBuffer.append(localStringBuffer.hashCode()).append('.').append(getUniqueId()).append('.').append(System.currentTimeMillis()).append('.').append("JavaMail.").append(str);
      return localStringBuffer.toString();
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.internet.UniqueValue
 * JD-Core Version:    0.6.2
 */