package javax.mail;

public abstract interface QuotaAwareStore
{
  public abstract Quota[] getQuota(String paramString)
    throws MessagingException;

  public abstract void setQuota(Quota paramQuota)
    throws MessagingException;
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.QuotaAwareStore
 * JD-Core Version:    0.6.2
 */