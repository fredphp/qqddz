package javax.activation;

import java.io.File;

public abstract class FileTypeMap
{
  private static FileTypeMap defaultMap = null;

  public static FileTypeMap getDefaultFileTypeMap()
  {
    if (defaultMap == null)
      defaultMap = new MimetypesFileTypeMap();
    return defaultMap;
  }

  public static void setDefaultFileTypeMap(FileTypeMap paramFileTypeMap)
  {
    SecurityManager localSecurityManager = System.getSecurityManager();
    if (localSecurityManager != null);
    try
    {
      localSecurityManager.checkSetFactory();
      defaultMap = paramFileTypeMap;
      return;
    }
    catch (SecurityException localSecurityException)
    {
      while (FileTypeMap.class.getClassLoader() == paramFileTypeMap.getClass().getClassLoader());
      throw localSecurityException;
    }
  }

  public abstract String getContentType(File paramFile);

  public abstract String getContentType(String paramString);
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.activation.FileTypeMap
 * JD-Core Version:    0.6.2
 */