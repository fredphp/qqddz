package javax.mail;

public abstract class BodyPart
  implements Part
{
  protected Multipart parent;

  public Multipart getParent()
  {
    return this.parent;
  }

  void setParent(Multipart paramMultipart)
  {
    this.parent = paramMultipart;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.BodyPart
 * JD-Core Version:    0.6.2
 */