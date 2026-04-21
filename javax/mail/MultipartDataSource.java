package javax.mail;

import javax.activation.DataSource;

public abstract interface MultipartDataSource extends DataSource
{
  public abstract BodyPart getBodyPart(int paramInt)
    throws MessagingException;

  public abstract int getCount();
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.MultipartDataSource
 * JD-Core Version:    0.6.2
 */