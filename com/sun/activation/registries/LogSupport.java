package com.sun.activation.registries;

import java.io.PrintStream;
import java.util.logging.Level;
import java.util.logging.Logger;

public class LogSupport
{
  private static boolean debug = false;
  private static final Level level = Level.FINE;
  private static Logger logger;

  static
  {
    try
    {
      debug = Boolean.getBoolean("javax.activation.debug");
      label18: logger = Logger.getLogger("javax.activation");
      return;
    }
    catch (Throwable localThrowable)
    {
      break label18;
    }
  }

  public static boolean isLoggable()
  {
    return (debug) || (logger.isLoggable(level));
  }

  public static void log(String paramString)
  {
    if (debug)
      System.out.println(paramString);
    logger.log(level, paramString);
  }

  public static void log(String paramString, Throwable paramThrowable)
  {
    if (debug)
      System.out.println(paramString + "; Exception: " + paramThrowable);
    logger.log(level, paramString, paramThrowable);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.activation.registries.LogSupport
 * JD-Core Version:    0.6.2
 */