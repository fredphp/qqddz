package javax.activation;

public abstract class CommandMap
{
  private static CommandMap defaultCommandMap = null;

  public static CommandMap getDefaultCommandMap()
  {
    if (defaultCommandMap == null)
      defaultCommandMap = new MailcapCommandMap();
    return defaultCommandMap;
  }

  public static void setDefaultCommandMap(CommandMap paramCommandMap)
  {
    SecurityManager localSecurityManager = System.getSecurityManager();
    if (localSecurityManager != null);
    try
    {
      localSecurityManager.checkSetFactory();
      defaultCommandMap = paramCommandMap;
      return;
    }
    catch (SecurityException localSecurityException)
    {
      while (CommandMap.class.getClassLoader() == paramCommandMap.getClass().getClassLoader());
      throw localSecurityException;
    }
  }

  public abstract DataContentHandler createDataContentHandler(String paramString);

  public DataContentHandler createDataContentHandler(String paramString, DataSource paramDataSource)
  {
    return createDataContentHandler(paramString);
  }

  public abstract CommandInfo[] getAllCommands(String paramString);

  public CommandInfo[] getAllCommands(String paramString, DataSource paramDataSource)
  {
    return getAllCommands(paramString);
  }

  public abstract CommandInfo getCommand(String paramString1, String paramString2);

  public CommandInfo getCommand(String paramString1, String paramString2, DataSource paramDataSource)
  {
    return getCommand(paramString1, paramString2);
  }

  public String[] getMimeTypes()
  {
    return null;
  }

  public abstract CommandInfo[] getPreferredCommands(String paramString);

  public CommandInfo[] getPreferredCommands(String paramString, DataSource paramDataSource)
  {
    return getPreferredCommands(paramString);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.activation.CommandMap
 * JD-Core Version:    0.6.2
 */