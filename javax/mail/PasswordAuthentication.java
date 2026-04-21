package javax.mail;

public final class PasswordAuthentication
{
  private String password;
  private String userName;

  public PasswordAuthentication(String paramString1, String paramString2)
  {
    this.userName = paramString1;
    this.password = paramString2;
  }

  public String getPassword()
  {
    return this.password;
  }

  public String getUserName()
  {
    return this.userName;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.PasswordAuthentication
 * JD-Core Version:    0.6.2
 */