package com.qqgame.mrzerg.mail;

import java.security.AccessController;
import java.security.PrivilegedAction;
import java.security.Provider;

public final class JSSEProvider extends Provider
{
  public JSSEProvider()
  {
    super("HarmonyJSSE", 1.0D, "Harmony JSSE Provider");
    AccessController.doPrivileged(new PrivilegedAction()
    {
      public Void run()
      {
        JSSEProvider.this.put("SSLContext.TLS", "org.apache.harmony.xnet.provider.jsse.SSLContextImpl");
        JSSEProvider.this.put("Alg.Alias.SSLContext.TLSv1", "TLS");
        JSSEProvider.this.put("KeyManagerFactory.X509", "org.apache.harmony.xnet.provider.jsse.KeyManagerFactoryImpl");
        JSSEProvider.this.put("TrustManagerFactory.X509", "org.apache.harmony.xnet.provider.jsse.TrustManagerFactoryImpl");
        return null;
      }
    });
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.qqgame.mrzerg.mail.JSSEProvider
 * JD-Core Version:    0.6.2
 */