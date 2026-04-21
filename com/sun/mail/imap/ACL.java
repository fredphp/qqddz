package com.sun.mail.imap;

public class ACL
  implements Cloneable
{
  private String name;
  private Rights rights;

  public ACL(String paramString)
  {
    this.name = paramString;
    this.rights = new Rights();
  }

  public ACL(String paramString, Rights paramRights)
  {
    this.name = paramString;
    this.rights = paramRights;
  }

  public Object clone()
    throws CloneNotSupportedException
  {
    ACL localACL = (ACL)super.clone();
    localACL.rights = ((Rights)this.rights.clone());
    return localACL;
  }

  public String getName()
  {
    return this.name;
  }

  public Rights getRights()
  {
    return this.rights;
  }

  public void setRights(Rights paramRights)
  {
    this.rights = paramRights;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.imap.ACL
 * JD-Core Version:    0.6.2
 */