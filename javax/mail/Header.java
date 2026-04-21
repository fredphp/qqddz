package javax.mail;

public class Header
{
  protected String name;
  protected String value;

  public Header(String paramString1, String paramString2)
  {
    this.name = paramString1;
    this.value = paramString2;
  }

  public String getName()
  {
    return this.name;
  }

  public String getValue()
  {
    return this.value;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.Header
 * JD-Core Version:    0.6.2
 */