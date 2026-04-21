package org.apache.harmony.misc;

public class SystemUtils
{
  public static final int ARC_IA32 = 1;
  public static final int ARC_IA64 = 2;
  public static final int ARC_UNKNOWN = -1;
  public static final int OS_LINUX = 2;
  public static final int OS_UNKNOWN = -1;
  public static final int OS_WINDOWS = 1;
  private static int arc = 0;
  private static int os = 0;

  public static int getOS()
  {
    String str;
    if (os == 0)
    {
      str = System.getProperty("os.name").substring(0, 3);
      if (str.compareToIgnoreCase("win") != 0)
        break label34;
      os = 1;
    }
    while (true)
    {
      return os;
      label34: if (str.compareToIgnoreCase("lin") == 0)
        os = 2;
      else
        os = -1;
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     org.apache.harmony.misc.SystemUtils
 * JD-Core Version:    0.6.2
 */