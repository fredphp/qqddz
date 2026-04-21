package javax.activation;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.security.AccessController;
import java.security.PrivilegedAction;
import java.security.PrivilegedActionException;
import java.security.PrivilegedExceptionAction;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;

class SecuritySupport
{
  public static ClassLoader getContextClassLoader()
  {
    return (ClassLoader)AccessController.doPrivileged(new PrivilegedAction()
    {
      public Object run()
      {
        try
        {
          ClassLoader localClassLoader = Thread.currentThread().getContextClassLoader();
          return localClassLoader;
        }
        catch (SecurityException localSecurityException)
        {
        }
        return null;
      }
    });
  }

  public static InputStream getResourceAsStream(Class paramClass, final String paramString)
    throws IOException
  {
    try
    {
      InputStream localInputStream = (InputStream)AccessController.doPrivileged(new PrivilegedExceptionAction()
      {
        public Object run()
          throws IOException
        {
          return SecuritySupport.this.getResourceAsStream(paramString);
        }
      });
      return localInputStream;
    }
    catch (PrivilegedActionException localPrivilegedActionException)
    {
      throw ((IOException)localPrivilegedActionException.getException());
    }
  }

  public static URL[] getResources(ClassLoader paramClassLoader, final String paramString)
  {
    return (URL[])AccessController.doPrivileged(new PrivilegedAction()
    {
      public Object run()
      {
        URL[] arrayOfURL = (URL[])null;
        try
        {
          ArrayList localArrayList = new ArrayList();
          Enumeration localEnumeration = SecuritySupport.this.getResources(paramString);
          while (true)
          {
            if ((localEnumeration == null) || (!localEnumeration.hasMoreElements()))
            {
              if (localArrayList.size() <= 0)
                break;
              arrayOfURL = new URL[localArrayList.size()];
              return (URL[])localArrayList.toArray(arrayOfURL);
            }
            URL localURL = (URL)localEnumeration.nextElement();
            if (localURL != null)
              localArrayList.add(localURL);
          }
        }
        catch (IOException localIOException)
        {
          return arrayOfURL;
        }
        catch (SecurityException localSecurityException)
        {
        }
        return arrayOfURL;
      }
    });
  }

  public static URL[] getSystemResources(String paramString)
  {
    return (URL[])AccessController.doPrivileged(new PrivilegedAction()
    {
      public Object run()
      {
        URL[] arrayOfURL = (URL[])null;
        try
        {
          ArrayList localArrayList = new ArrayList();
          Enumeration localEnumeration = ClassLoader.getSystemResources(SecuritySupport.this);
          while (true)
          {
            if ((localEnumeration == null) || (!localEnumeration.hasMoreElements()))
            {
              if (localArrayList.size() <= 0)
                break;
              arrayOfURL = new URL[localArrayList.size()];
              return (URL[])localArrayList.toArray(arrayOfURL);
            }
            URL localURL = (URL)localEnumeration.nextElement();
            if (localURL != null)
              localArrayList.add(localURL);
          }
        }
        catch (IOException localIOException)
        {
          return arrayOfURL;
        }
        catch (SecurityException localSecurityException)
        {
        }
        return arrayOfURL;
      }
    });
  }

  public static InputStream openStream(URL paramURL)
    throws IOException
  {
    try
    {
      InputStream localInputStream = (InputStream)AccessController.doPrivileged(new PrivilegedExceptionAction()
      {
        public Object run()
          throws IOException
        {
          return SecuritySupport.this.openStream();
        }
      });
      return localInputStream;
    }
    catch (PrivilegedActionException localPrivilegedActionException)
    {
      throw ((IOException)localPrivilegedActionException.getException());
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.activation.SecuritySupport
 * JD-Core Version:    0.6.2
 */