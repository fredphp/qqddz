package myjava.awt.datatransfer;

public class UnsupportedFlavorException extends Exception
{
  private static final long serialVersionUID = 5383814944251665601L;

  public UnsupportedFlavorException(DataFlavor paramDataFlavor)
  {
    super("flavor = " + String.valueOf(paramDataFlavor));
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     myjava.awt.datatransfer.UnsupportedFlavorException
 * JD-Core Version:    0.6.2
 */