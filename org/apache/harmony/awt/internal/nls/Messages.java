package org.apache.harmony.awt.internal.nls;

import java.security.AccessController;
import java.security.PrivilegedAction;
import java.util.Locale;
import java.util.MissingResourceException;
import java.util.ResourceBundle;

public class Messages
{
  private static ResourceBundle bundle = null;

  static
  {
    try
    {
      bundle = setLocale(Locale.getDefault(), "org.apache.harmony.awt.internal.nls.messages");
      return;
    }
    catch (Throwable localThrowable)
    {
      localThrowable.printStackTrace();
    }
  }

  public static String format(String paramString, Object[] paramArrayOfObject)
  {
    StringBuilder localStringBuilder = new StringBuilder(paramString.length() + 20 * paramArrayOfObject.length);
    String[] arrayOfString = new String[paramArrayOfObject.length];
    int i = 0;
    int j;
    int k;
    if (i >= paramArrayOfObject.length)
    {
      j = 0;
      k = paramString.indexOf('{', 0);
      if (k < 0)
      {
        if (j < paramString.length())
          localStringBuilder.append(paramString.substring(j, paramString.length()));
        return localStringBuilder.toString();
      }
    }
    else
    {
      if (paramArrayOfObject[i] == null)
        arrayOfString[i] = "<null>";
      while (true)
      {
        i++;
        break;
        arrayOfString[i] = paramArrayOfObject[i].toString();
      }
    }
    if ((k != 0) && (paramString.charAt(k - 1) == '\\'))
    {
      if (k != 1)
        localStringBuilder.append(paramString.substring(j, k - 1));
      localStringBuilder.append('{');
      j = k + 1;
    }
    int m;
    while (true)
    {
      k = paramString.indexOf('{', j);
      break;
      if (k > -3 + paramString.length())
      {
        localStringBuilder.append(paramString.substring(j, paramString.length()));
        j = paramString.length();
      }
      else
      {
        m = (byte)Character.digit(paramString.charAt(k + 1), 10);
        if ((m >= 0) && (paramString.charAt(k + 2) == '}'))
          break label272;
        localStringBuilder.append(paramString.substring(j, k + 1));
        j = k + 1;
      }
    }
    label272: localStringBuilder.append(paramString.substring(j, k));
    if (m >= arrayOfString.length)
      localStringBuilder.append("<missing argument>");
    while (true)
    {
      j = k + 3;
      break;
      localStringBuilder.append(arrayOfString[m]);
    }
  }

  public static String getString(String paramString)
  {
    if (bundle == null)
      return paramString;
    try
    {
      String str = bundle.getString(paramString);
      return str;
    }
    catch (MissingResourceException localMissingResourceException)
    {
    }
    return "Missing message: " + paramString;
  }

  public static String getString(String paramString, char paramChar)
  {
    Object[] arrayOfObject = new Object[1];
    arrayOfObject[0] = String.valueOf(paramChar);
    return getString(paramString, arrayOfObject);
  }

  public static String getString(String paramString, int paramInt)
  {
    Object[] arrayOfObject = new Object[1];
    arrayOfObject[0] = Integer.toString(paramInt);
    return getString(paramString, arrayOfObject);
  }

  public static String getString(String paramString, Object paramObject)
  {
    return getString(paramString, new Object[] { paramObject });
  }

  public static String getString(String paramString, Object paramObject1, Object paramObject2)
  {
    return getString(paramString, new Object[] { paramObject1, paramObject2 });
  }

  public static String getString(String paramString, Object[] paramArrayOfObject)
  {
    Object localObject = paramString;
    if (bundle != null);
    try
    {
      String str = bundle.getString(paramString);
      localObject = str;
      label20: return format((String)localObject, paramArrayOfObject);
    }
    catch (MissingResourceException localMissingResourceException)
    {
      break label20;
    }
  }

  public static ResourceBundle setLocale(final Locale paramLocale, String paramString)
  {
    try
    {
      ResourceBundle localResourceBundle = (ResourceBundle)AccessController.doPrivileged(new PrivilegedAction()
      {
        public Object run()
        {
          String str = Messages.this;
          Locale localLocale = paramLocale;
          if (this.val$loader != null);
          for (ClassLoader localClassLoader = this.val$loader; ; localClassLoader = ClassLoader.getSystemClassLoader())
            return ResourceBundle.getBundle(str, localLocale, localClassLoader);
        }
      });
      return localResourceBundle;
    }
    catch (MissingResourceException localMissingResourceException)
    {
    }
    return null;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     org.apache.harmony.awt.internal.nls.Messages
 * JD-Core Version:    0.6.2
 */