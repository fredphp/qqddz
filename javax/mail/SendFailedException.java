package javax.mail;

public class SendFailedException extends MessagingException
{
  private static final long serialVersionUID = -6457531621682372913L;
  protected transient Address[] invalid;
  protected transient Address[] validSent;
  protected transient Address[] validUnsent;

  public SendFailedException()
  {
  }

  public SendFailedException(String paramString)
  {
    super(paramString);
  }

  public SendFailedException(String paramString, Exception paramException)
  {
    super(paramString, paramException);
  }

  public SendFailedException(String paramString, Exception paramException, Address[] paramArrayOfAddress1, Address[] paramArrayOfAddress2, Address[] paramArrayOfAddress3)
  {
    super(paramString, paramException);
    this.validSent = paramArrayOfAddress1;
    this.validUnsent = paramArrayOfAddress2;
    this.invalid = paramArrayOfAddress3;
  }

  public Address[] getInvalidAddresses()
  {
    return this.invalid;
  }

  public Address[] getValidSentAddresses()
  {
    return this.validSent;
  }

  public Address[] getValidUnsentAddresses()
  {
    return this.validUnsent;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.SendFailedException
 * JD-Core Version:    0.6.2
 */