package javax.mail;

public class Provider
{
  private String className;
  private String protocol;
  private Type type;
  private String vendor;
  private String version;

  public Provider(Type paramType, String paramString1, String paramString2, String paramString3, String paramString4)
  {
    this.type = paramType;
    this.protocol = paramString1;
    this.className = paramString2;
    this.vendor = paramString3;
    this.version = paramString4;
  }

  public String getClassName()
  {
    return this.className;
  }

  public String getProtocol()
  {
    return this.protocol;
  }

  public Type getType()
  {
    return this.type;
  }

  public String getVendor()
  {
    return this.vendor;
  }

  public String getVersion()
  {
    return this.version;
  }

  public String toString()
  {
    String str = "javax.mail.Provider[" + this.type + "," + this.protocol + "," + this.className;
    if (this.vendor != null)
      str = str + "," + this.vendor;
    if (this.version != null)
      str = str + "," + this.version;
    return str + "]";
  }

  public static class Type
  {
    public static final Type STORE = new Type("STORE");
    public static final Type TRANSPORT = new Type("TRANSPORT");
    private String type;

    private Type(String paramString)
    {
      this.type = paramString;
    }

    public String toString()
    {
      return this.type;
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.Provider
 * JD-Core Version:    0.6.2
 */