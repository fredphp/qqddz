package javax.mail;

public class StoreClosedException extends MessagingException
{
  private static final long serialVersionUID = -3145392336120082655L;
  private transient Store store;

  public StoreClosedException(Store paramStore)
  {
    this(paramStore, null);
  }

  public StoreClosedException(Store paramStore, String paramString)
  {
    super(paramString);
    this.store = paramStore;
  }

  public Store getStore()
  {
    return this.store;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.StoreClosedException
 * JD-Core Version:    0.6.2
 */