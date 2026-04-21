package javax.mail;

public abstract interface UIDFolder
{
  public static final long LASTUID = -1L;

  public abstract Message getMessageByUID(long paramLong)
    throws MessagingException;

  public abstract Message[] getMessagesByUID(long paramLong1, long paramLong2)
    throws MessagingException;

  public abstract Message[] getMessagesByUID(long[] paramArrayOfLong)
    throws MessagingException;

  public abstract long getUID(Message paramMessage)
    throws MessagingException;

  public abstract long getUIDValidity()
    throws MessagingException;

  public static class FetchProfileItem extends FetchProfile.Item
  {
    public static final FetchProfileItem UID = new FetchProfileItem("UID");

    protected FetchProfileItem(String paramString)
    {
      super();
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.UIDFolder
 * JD-Core Version:    0.6.2
 */