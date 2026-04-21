package com.sun.mail.imap;

import com.sun.mail.iap.ConnectionException;
import com.sun.mail.iap.ProtocolException;
import com.sun.mail.iap.Response;
import com.sun.mail.iap.ResponseHandler;
import com.sun.mail.imap.protocol.IMAPProtocol;
import com.sun.mail.imap.protocol.Namespaces;
import com.sun.mail.imap.protocol.Namespaces.Namespace;
import java.io.PrintStream;
import java.util.Map;
import java.util.StringTokenizer;
import java.util.Vector;
import javax.mail.Folder;
import javax.mail.MessagingException;
import javax.mail.QuotaAwareStore;
import javax.mail.Session;
import javax.mail.Store;
import javax.mail.URLName;

public class IMAPStore extends Store
  implements QuotaAwareStore, ResponseHandler
{
  public static final int RESPONSE = 1000;
  private int appendBufferSize = -1;
  private String authorizationID;
  private int blksize = 16384;
  private volatile boolean connected = false;
  private int defaultPort = 143;
  private boolean disableAuthLogin = false;
  private boolean disableAuthPlain = false;
  private boolean enableImapEvents = false;
  private boolean enableSASL = false;
  private boolean enableStartTLS = false;
  private boolean forcePasswordRefresh = false;
  private String host;
  private boolean isSSL = false;
  private int minIdleTime = 10;
  private String name = "imap";
  private Namespaces namespaces;
  private PrintStream out;
  private String password;
  private ConnectionPool pool = new ConnectionPool();
  private int port = -1;
  private String proxyAuthUser;
  private String[] saslMechanisms;
  private String saslRealm;
  private int statusCacheTimeout = 1000;
  private String user;

  static
  {
    if (!IMAPStore.class.desiredAssertionStatus());
    for (boolean bool = true; ; bool = false)
    {
      $assertionsDisabled = bool;
      return;
    }
  }

  public IMAPStore(Session paramSession, URLName paramURLName)
  {
    this(paramSession, paramURLName, "imap", 143, false);
  }

  protected IMAPStore(Session paramSession, URLName paramURLName, String paramString, int paramInt, boolean paramBoolean)
  {
    super(paramSession, paramURLName);
    if (paramURLName != null)
      paramString = paramURLName.getProtocol();
    this.name = paramString;
    this.defaultPort = paramInt;
    this.isSSL = paramBoolean;
    this.pool.lastTimePruned = System.currentTimeMillis();
    this.debug = paramSession.getDebug();
    this.out = paramSession.getDebugOut();
    if (this.out == null)
      this.out = System.out;
    String str1 = paramSession.getProperty("mail." + paramString + ".connectionpool.debug");
    if ((str1 != null) && (str1.equalsIgnoreCase("true")))
      this.pool.debug = true;
    String str2 = paramSession.getProperty("mail." + paramString + ".partialfetch");
    if ((str2 != null) && (str2.equalsIgnoreCase("false")))
    {
      this.blksize = -1;
      if (this.debug)
        this.out.println("DEBUG: mail.imap.partialfetch: false");
    }
    while (true)
    {
      String str4 = paramSession.getProperty("mail." + paramString + ".statuscachetimeout");
      if (str4 != null)
      {
        this.statusCacheTimeout = Integer.parseInt(str4);
        if (this.debug)
          this.out.println("DEBUG: mail.imap.statuscachetimeout: " + this.statusCacheTimeout);
      }
      String str5 = paramSession.getProperty("mail." + paramString + ".appendbuffersize");
      if (str5 != null)
      {
        this.appendBufferSize = Integer.parseInt(str5);
        if (this.debug)
          this.out.println("DEBUG: mail.imap.appendbuffersize: " + this.appendBufferSize);
      }
      String str6 = paramSession.getProperty("mail." + paramString + ".minidletime");
      if (str6 != null)
      {
        this.minIdleTime = Integer.parseInt(str6);
        if (this.debug)
          this.out.println("DEBUG: mail.imap.minidletime: " + this.minIdleTime);
      }
      String str7 = paramSession.getProperty("mail." + paramString + ".connectionpoolsize");
      if (str7 != null);
      try
      {
        int k = Integer.parseInt(str7);
        if (k > 0)
          this.pool.poolSize = k;
        label554: if (this.pool.debug)
          this.out.println("DEBUG: mail.imap.connectionpoolsize: " + this.pool.poolSize);
        String str8 = paramSession.getProperty("mail." + paramString + ".connectionpooltimeout");
        if (str8 != null);
        try
        {
          int j = Integer.parseInt(str8);
          if (j > 0)
            this.pool.clientTimeoutInterval = j;
          label647: if (this.pool.debug)
            this.out.println("DEBUG: mail.imap.connectionpooltimeout: " + this.pool.clientTimeoutInterval);
          String str9 = paramSession.getProperty("mail." + paramString + ".servertimeout");
          if (str9 != null);
          try
          {
            int i = Integer.parseInt(str9);
            if (i > 0)
              this.pool.serverTimeoutInterval = i;
            label740: if (this.pool.debug)
              this.out.println("DEBUG: mail.imap.servertimeout: " + this.pool.serverTimeoutInterval);
            String str10 = paramSession.getProperty("mail." + paramString + ".separatestoreconnection");
            if ((str10 != null) && (str10.equalsIgnoreCase("true")))
            {
              if (this.pool.debug)
                this.out.println("DEBUG: dedicate a store connection");
              this.pool.separateStoreConnection = true;
            }
            String str11 = paramSession.getProperty("mail." + paramString + ".proxyauth.user");
            if (str11 != null)
            {
              this.proxyAuthUser = str11;
              if (this.debug)
                this.out.println("DEBUG: mail.imap.proxyauth.user: " + this.proxyAuthUser);
            }
            String str12 = paramSession.getProperty("mail." + paramString + ".auth.login.disable");
            if ((str12 != null) && (str12.equalsIgnoreCase("true")))
            {
              if (this.debug)
                this.out.println("DEBUG: disable AUTH=LOGIN");
              this.disableAuthLogin = true;
            }
            String str13 = paramSession.getProperty("mail." + paramString + ".auth.plain.disable");
            if ((str13 != null) && (str13.equalsIgnoreCase("true")))
            {
              if (this.debug)
                this.out.println("DEBUG: disable AUTH=PLAIN");
              this.disableAuthPlain = true;
            }
            String str14 = paramSession.getProperty("mail." + paramString + ".starttls.enable");
            if ((str14 != null) && (str14.equalsIgnoreCase("true")))
            {
              if (this.debug)
                this.out.println("DEBUG: enable STARTTLS");
              this.enableStartTLS = true;
            }
            String str15 = paramSession.getProperty("mail." + paramString + ".sasl.enable");
            if ((str15 != null) && (str15.equalsIgnoreCase("true")))
            {
              if (this.debug)
                this.out.println("DEBUG: enable SASL");
              this.enableSASL = true;
            }
            Vector localVector;
            StringTokenizer localStringTokenizer;
            if (this.enableSASL)
            {
              String str20 = paramSession.getProperty("mail." + paramString + ".sasl.mechanisms");
              if ((str20 != null) && (str20.length() > 0))
              {
                if (this.debug)
                  this.out.println("DEBUG: SASL mechanisms allowed: " + str20);
                localVector = new Vector(5);
                localStringTokenizer = new StringTokenizer(str20, " ,");
              }
            }
            while (true)
            {
              if (!localStringTokenizer.hasMoreTokens())
              {
                this.saslMechanisms = new String[localVector.size()];
                localVector.copyInto(this.saslMechanisms);
                String str16 = paramSession.getProperty("mail." + paramString + ".sasl.authorizationid");
                if (str16 != null)
                {
                  this.authorizationID = str16;
                  if (this.debug)
                    this.out.println("DEBUG: mail.imap.sasl.authorizationid: " + this.authorizationID);
                }
                String str17 = paramSession.getProperty("mail." + paramString + ".sasl.realm");
                if (str17 != null)
                {
                  this.saslRealm = str17;
                  if (this.debug)
                    this.out.println("DEBUG: mail.imap.sasl.realm: " + this.saslRealm);
                }
                String str18 = paramSession.getProperty("mail." + paramString + ".forcepasswordrefresh");
                if ((str18 != null) && (str18.equalsIgnoreCase("true")))
                {
                  if (this.debug)
                    this.out.println("DEBUG: enable forcePasswordRefresh");
                  this.forcePasswordRefresh = true;
                }
                String str19 = paramSession.getProperty("mail." + paramString + ".enableimapevents");
                if ((str19 != null) && (str19.equalsIgnoreCase("true")))
                {
                  if (this.debug)
                    this.out.println("DEBUG: enable IMAP events");
                  this.enableImapEvents = true;
                }
                return;
                String str3 = paramSession.getProperty("mail." + paramString + ".fetchsize");
                if (str3 != null)
                  this.blksize = Integer.parseInt(str3);
                if (!this.debug)
                  break;
                this.out.println("DEBUG: mail.imap.fetchsize: " + this.blksize);
                break;
              }
              String str21 = localStringTokenizer.nextToken();
              if (str21.length() > 0)
                localVector.addElement(str21);
            }
          }
          catch (NumberFormatException localNumberFormatException1)
          {
            break label740;
          }
        }
        catch (NumberFormatException localNumberFormatException2)
        {
          break label647;
        }
      }
      catch (NumberFormatException localNumberFormatException3)
      {
        break label554;
      }
    }
  }

  private void checkConnected()
  {
    assert (Thread.holdsLock(this));
    if (!this.connected)
    {
      super.setConnected(false);
      throw new IllegalStateException("Not connected");
    }
  }

  private void cleanup()
  {
    cleanup(false);
  }

  private void cleanup(boolean paramBoolean)
  {
    if (this.debug)
      this.out.println("DEBUG: IMAPStore cleanup, force " + paramBoolean);
    Vector localVector = null;
    int i;
    synchronized (this.pool)
    {
      if (this.pool.folders != null)
      {
        i = 0;
        localVector = this.pool.folders;
        this.pool.folders = null;
        label69: if (i == 0)
          break label134;
      }
    }
    while (true)
    {
      label134: int j;
      IMAPFolder localIMAPFolder;
      synchronized (this.pool)
      {
        emptyConnectionPool(paramBoolean);
        this.connected = false;
        notifyConnectionListeners(3);
        if (this.debug)
          this.out.println("DEBUG: IMAPStore cleanup done");
        return;
        i = 1;
        break label69;
        localObject1 = finally;
        throw localObject1;
        j = 0;
        int k = localVector.size();
        if (j >= k)
          break;
        localIMAPFolder = (IMAPFolder)localVector.elementAt(j);
        if (!paramBoolean);
      }
      try
      {
        if (this.debug)
          this.out.println("DEBUG: force folder to close");
        localIMAPFolder.forceClose();
        break label231;
        if (this.debug)
          this.out.println("DEBUG: close folder");
        localIMAPFolder.close(false);
      }
      catch (MessagingException localMessagingException)
      {
        break label231;
        localObject2 = finally;
        throw localObject2;
      }
      catch (IllegalStateException localIllegalStateException)
      {
      }
      label231: j++;
    }
  }

  private void emptyConnectionPool(boolean paramBoolean)
  {
    while (true)
    {
      int i;
      synchronized (this.pool)
      {
        i = -1 + this.pool.authenticatedConnections.size();
        if (i < 0)
        {
          this.pool.authenticatedConnections.removeAllElements();
          if (this.pool.debug)
            this.out.println("DEBUG: removed all authenticated connections");
          return;
        }
        try
        {
          IMAPProtocol localIMAPProtocol = (IMAPProtocol)this.pool.authenticatedConnections.elementAt(i);
          localIMAPProtocol.removeResponseHandler(this);
          if (paramBoolean)
            localIMAPProtocol.disconnect();
          else
            localIMAPProtocol.logout();
        }
        catch (ProtocolException localProtocolException)
        {
        }
      }
      i--;
    }
  }

  // ERROR //
  private Namespaces getNamespaces()
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: invokespecial 419	com/sun/mail/imap/IMAPStore:checkConnected	()V
    //   6: aconst_null
    //   7: astore_2
    //   8: aload_0
    //   9: getfield 421	com/sun/mail/imap/IMAPStore:namespaces	Lcom/sun/mail/imap/protocol/Namespaces;
    //   12: astore_3
    //   13: aload_3
    //   14: ifnonnull +29 -> 43
    //   17: aload_0
    //   18: invokevirtual 425	com/sun/mail/imap/IMAPStore:getStoreProtocol	()Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   21: astore_2
    //   22: aload_0
    //   23: aload_2
    //   24: invokevirtual 428	com/sun/mail/imap/protocol/IMAPProtocol:namespace	()Lcom/sun/mail/imap/protocol/Namespaces;
    //   27: putfield 421	com/sun/mail/imap/IMAPStore:namespaces	Lcom/sun/mail/imap/protocol/Namespaces;
    //   30: aload_0
    //   31: aload_2
    //   32: invokevirtual 432	com/sun/mail/imap/IMAPStore:releaseStoreProtocol	(Lcom/sun/mail/imap/protocol/IMAPProtocol;)V
    //   35: aload_2
    //   36: ifnonnull +7 -> 43
    //   39: aload_0
    //   40: invokespecial 434	com/sun/mail/imap/IMAPStore:cleanup	()V
    //   43: aload_0
    //   44: getfield 421	com/sun/mail/imap/IMAPStore:namespaces	Lcom/sun/mail/imap/protocol/Namespaces;
    //   47: astore 4
    //   49: aload_0
    //   50: monitorexit
    //   51: aload 4
    //   53: areturn
    //   54: astore 8
    //   56: aload_0
    //   57: aload_2
    //   58: invokevirtual 432	com/sun/mail/imap/IMAPStore:releaseStoreProtocol	(Lcom/sun/mail/imap/protocol/IMAPProtocol;)V
    //   61: aload_2
    //   62: ifnonnull -19 -> 43
    //   65: aload_0
    //   66: invokespecial 434	com/sun/mail/imap/IMAPStore:cleanup	()V
    //   69: goto -26 -> 43
    //   72: astore_1
    //   73: aload_0
    //   74: monitorexit
    //   75: aload_1
    //   76: athrow
    //   77: astore 7
    //   79: new 436	javax/mail/StoreClosedException
    //   82: dup
    //   83: aload_0
    //   84: aload 7
    //   86: invokevirtual 439	com/sun/mail/iap/ConnectionException:getMessage	()Ljava/lang/String;
    //   89: invokespecial 442	javax/mail/StoreClosedException:<init>	(Ljavax/mail/Store;Ljava/lang/String;)V
    //   92: athrow
    //   93: astore 6
    //   95: aload_0
    //   96: aload_2
    //   97: invokevirtual 432	com/sun/mail/imap/IMAPStore:releaseStoreProtocol	(Lcom/sun/mail/imap/protocol/IMAPProtocol;)V
    //   100: aload_2
    //   101: ifnonnull +7 -> 108
    //   104: aload_0
    //   105: invokespecial 434	com/sun/mail/imap/IMAPStore:cleanup	()V
    //   108: aload 6
    //   110: athrow
    //   111: astore 5
    //   113: new 352	javax/mail/MessagingException
    //   116: dup
    //   117: aload 5
    //   119: invokevirtual 443	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   122: aload 5
    //   124: invokespecial 446	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   127: athrow
    //
    // Exception table:
    //   from	to	target	type
    //   17	30	54	com/sun/mail/iap/BadCommandException
    //   2	6	72	finally
    //   8	13	72	finally
    //   30	35	72	finally
    //   39	43	72	finally
    //   43	49	72	finally
    //   56	61	72	finally
    //   65	69	72	finally
    //   95	100	72	finally
    //   104	108	72	finally
    //   108	111	72	finally
    //   17	30	77	com/sun/mail/iap/ConnectionException
    //   17	30	93	finally
    //   79	93	93	finally
    //   113	128	93	finally
    //   17	30	111	com/sun/mail/iap/ProtocolException
  }

  private void login(IMAPProtocol paramIMAPProtocol, String paramString1, String paramString2)
    throws ProtocolException
  {
    if ((this.enableStartTLS) && (paramIMAPProtocol.hasCapability("STARTTLS")))
    {
      paramIMAPProtocol.startTLS();
      paramIMAPProtocol.capability();
    }
    if (paramIMAPProtocol.isAuthenticated())
      return;
    paramIMAPProtocol.getCapabilities().put("__PRELOGIN__", "");
    String str;
    if (this.authorizationID != null)
      str = this.authorizationID;
    while (true)
    {
      if (this.enableSASL)
        paramIMAPProtocol.sasllogin(this.saslMechanisms, this.saslRealm, str, paramString1, paramString2);
      if (paramIMAPProtocol.isAuthenticated())
      {
        label92: if (this.proxyAuthUser != null)
          paramIMAPProtocol.proxyauth(this.proxyAuthUser);
        if (!paramIMAPProtocol.hasCapability("__PRELOGIN__"))
          break;
      }
      try
      {
        paramIMAPProtocol.capability();
        return;
      }
      catch (ConnectionException localConnectionException)
      {
        throw localConnectionException;
        if (this.proxyAuthUser != null)
        {
          str = this.proxyAuthUser;
        }
        else
        {
          str = paramString1;
          continue;
          if ((paramIMAPProtocol.hasCapability("AUTH=PLAIN")) && (!this.disableAuthPlain))
          {
            paramIMAPProtocol.authplain(str, paramString1, paramString2);
            break label92;
          }
          if (((paramIMAPProtocol.hasCapability("AUTH-LOGIN")) || (paramIMAPProtocol.hasCapability("AUTH=LOGIN"))) && (!this.disableAuthLogin))
          {
            paramIMAPProtocol.authlogin(paramString1, paramString2);
            break label92;
          }
          if (!paramIMAPProtocol.hasCapability("LOGINDISABLED"))
          {
            paramIMAPProtocol.login(paramString1, paramString2);
            break label92;
          }
          throw new ProtocolException("No login methods supported!");
        }
      }
      catch (ProtocolException localProtocolException)
      {
      }
    }
  }

  private Folder[] namespaceToFolders(Namespaces.Namespace[] paramArrayOfNamespace, String paramString)
  {
    Folder[] arrayOfFolder = new Folder[paramArrayOfNamespace.length];
    int i = 0;
    if (i >= arrayOfFolder.length)
      return arrayOfFolder;
    String str = paramArrayOfNamespace[i].prefix;
    label74: char c;
    if (paramString == null)
    {
      int j = str.length();
      if ((j > 0) && (str.charAt(j - 1) == paramArrayOfNamespace[i].delimiter))
        str = str.substring(0, j - 1);
      c = paramArrayOfNamespace[i].delimiter;
      if (paramString != null)
        break label138;
    }
    label138: for (boolean bool = true; ; bool = false)
    {
      arrayOfFolder[i] = new IMAPFolder(str, c, this, bool);
      i++;
      break;
      str = str + paramString;
      break label74;
    }
  }

  private void timeoutConnections()
  {
    while (true)
    {
      int i;
      IMAPProtocol localIMAPProtocol;
      synchronized (this.pool)
      {
        if ((System.currentTimeMillis() - this.pool.lastTimePruned > this.pool.pruningInterval) && (this.pool.authenticatedConnections.size() > 1))
        {
          if (this.pool.debug)
          {
            this.out.println("DEBUG: checking for connections to prune: " + (System.currentTimeMillis() - this.pool.lastTimePruned));
            this.out.println("DEBUG: clientTimeoutInterval: " + this.pool.clientTimeoutInterval);
          }
          i = -1 + this.pool.authenticatedConnections.size();
          if (i <= 0)
            this.pool.lastTimePruned = System.currentTimeMillis();
        }
        else
        {
          return;
        }
        localIMAPProtocol = (IMAPProtocol)this.pool.authenticatedConnections.elementAt(i);
        if (this.pool.debug)
          this.out.println("DEBUG: protocol last used: " + (System.currentTimeMillis() - localIMAPProtocol.getTimestamp()));
        if (System.currentTimeMillis() - localIMAPProtocol.getTimestamp() > this.pool.clientTimeoutInterval)
        {
          if (this.pool.debug)
          {
            this.out.println("DEBUG: authenticated connection timed out");
            this.out.println("DEBUG: logging out the connection");
          }
          localIMAPProtocol.removeResponseHandler(this);
          this.pool.authenticatedConnections.removeElementAt(i);
        }
      }
      try
      {
        localIMAPProtocol.logout();
        label277: i--;
        continue;
        localObject = finally;
        throw localObject;
      }
      catch (ProtocolException localProtocolException)
      {
        break label277;
      }
    }
  }

  private void waitIfIdle()
    throws ProtocolException
  {
    if ((!$assertionsDisabled) && (!Thread.holdsLock(this.pool)))
      throw new AssertionError();
    while (true)
    {
      if (this.pool.idleState == 1)
      {
        this.pool.idleProtocol.idleAbort();
        this.pool.idleState = 2;
      }
      try
      {
        this.pool.wait();
        label60: if (this.pool.idleState != 0)
          continue;
        return;
      }
      catch (InterruptedException localInterruptedException)
      {
        break label60;
      }
    }
  }

  boolean allowReadOnlySelect()
  {
    String str = this.session.getProperty("mail." + this.name + ".allowreadonlyselect");
    return (str != null) && (str.equalsIgnoreCase("true"));
  }

  // ERROR //
  public void close()
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: invokespecial 585	javax/mail/Store:isConnected	()Z
    //   6: istore_2
    //   7: iload_2
    //   8: ifne +6 -> 14
    //   11: aload_0
    //   12: monitorexit
    //   13: return
    //   14: aconst_null
    //   15: astore_3
    //   16: aload_0
    //   17: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   20: astore 6
    //   22: aload 6
    //   24: monitorenter
    //   25: aload_0
    //   26: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   29: invokestatic 394	com/sun/mail/imap/IMAPStore$ConnectionPool:access$10	(Lcom/sun/mail/imap/IMAPStore$ConnectionPool;)Ljava/util/Vector;
    //   32: invokevirtual 588	java/util/Vector:isEmpty	()Z
    //   35: istore 8
    //   37: aload 6
    //   39: monitorexit
    //   40: iload 8
    //   42: ifeq +85 -> 127
    //   45: aload_0
    //   46: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   49: invokestatic 206	com/sun/mail/imap/IMAPStore$ConnectionPool:access$3	(Lcom/sun/mail/imap/IMAPStore$ConnectionPool;)Z
    //   52: istore 12
    //   54: aconst_null
    //   55: astore_3
    //   56: iload 12
    //   58: ifeq +13 -> 71
    //   61: aload_0
    //   62: getfield 131	com/sun/mail/imap/IMAPStore:out	Ljava/io/PrintStream;
    //   65: ldc_w 590
    //   68: invokevirtual 175	java/io/PrintStream:println	(Ljava/lang/String;)V
    //   71: aload_0
    //   72: invokespecial 434	com/sun/mail/imap/IMAPStore:cleanup	()V
    //   75: aload_0
    //   76: aconst_null
    //   77: invokevirtual 432	com/sun/mail/imap/IMAPStore:releaseStoreProtocol	(Lcom/sun/mail/imap/protocol/IMAPProtocol;)V
    //   80: goto -69 -> 11
    //   83: astore_1
    //   84: aload_0
    //   85: monitorexit
    //   86: aload_1
    //   87: athrow
    //   88: astore 7
    //   90: aload 6
    //   92: monitorexit
    //   93: aload 7
    //   95: athrow
    //   96: astore 5
    //   98: aload_0
    //   99: invokespecial 434	com/sun/mail/imap/IMAPStore:cleanup	()V
    //   102: new 352	javax/mail/MessagingException
    //   105: dup
    //   106: aload 5
    //   108: invokevirtual 443	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   111: aload 5
    //   113: invokespecial 446	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   116: athrow
    //   117: astore 4
    //   119: aload_0
    //   120: aload_3
    //   121: invokevirtual 432	com/sun/mail/imap/IMAPStore:releaseStoreProtocol	(Lcom/sun/mail/imap/protocol/IMAPProtocol;)V
    //   124: aload 4
    //   126: athrow
    //   127: aload_0
    //   128: invokevirtual 425	com/sun/mail/imap/IMAPStore:getStoreProtocol	()Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   131: astore_3
    //   132: aload_0
    //   133: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   136: astore 9
    //   138: aload 9
    //   140: monitorenter
    //   141: aload_0
    //   142: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   145: invokestatic 394	com/sun/mail/imap/IMAPStore$ConnectionPool:access$10	(Lcom/sun/mail/imap/IMAPStore$ConnectionPool;)Ljava/util/Vector;
    //   148: aload_3
    //   149: invokevirtual 593	java/util/Vector:removeElement	(Ljava/lang/Object;)Z
    //   152: pop
    //   153: aload 9
    //   155: monitorexit
    //   156: aload_3
    //   157: invokevirtual 411	com/sun/mail/imap/protocol/IMAPProtocol:logout	()V
    //   160: aload_0
    //   161: aload_3
    //   162: invokevirtual 432	com/sun/mail/imap/IMAPStore:releaseStoreProtocol	(Lcom/sun/mail/imap/protocol/IMAPProtocol;)V
    //   165: goto -154 -> 11
    //   168: astore 10
    //   170: aload 9
    //   172: monitorexit
    //   173: aload 10
    //   175: athrow
    //
    // Exception table:
    //   from	to	target	type
    //   2	7	83	finally
    //   75	80	83	finally
    //   119	127	83	finally
    //   160	165	83	finally
    //   25	40	88	finally
    //   90	93	88	finally
    //   16	25	96	com/sun/mail/iap/ProtocolException
    //   45	54	96	com/sun/mail/iap/ProtocolException
    //   61	71	96	com/sun/mail/iap/ProtocolException
    //   71	75	96	com/sun/mail/iap/ProtocolException
    //   93	96	96	com/sun/mail/iap/ProtocolException
    //   127	141	96	com/sun/mail/iap/ProtocolException
    //   156	160	96	com/sun/mail/iap/ProtocolException
    //   173	176	96	com/sun/mail/iap/ProtocolException
    //   16	25	117	finally
    //   45	54	117	finally
    //   61	71	117	finally
    //   71	75	117	finally
    //   93	96	117	finally
    //   98	117	117	finally
    //   127	141	117	finally
    //   156	160	117	finally
    //   173	176	117	finally
    //   141	156	168	finally
    //   170	173	168	finally
  }

  protected void finalize()
    throws Throwable
  {
    super.finalize();
    close();
  }

  int getAppendBufferSize()
  {
    return this.appendBufferSize;
  }

  boolean getConnectionPoolDebug()
  {
    return this.pool.debug;
  }

  public Folder getDefaultFolder()
    throws MessagingException
  {
    try
    {
      checkConnected();
      DefaultFolder localDefaultFolder = new DefaultFolder(this);
      return localDefaultFolder;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  int getFetchBlockSize()
  {
    return this.blksize;
  }

  public Folder getFolder(String paramString)
    throws MessagingException
  {
    try
    {
      checkConnected();
      IMAPFolder localIMAPFolder = new IMAPFolder(paramString, 65535, this);
      return localIMAPFolder;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public Folder getFolder(URLName paramURLName)
    throws MessagingException
  {
    try
    {
      checkConnected();
      IMAPFolder localIMAPFolder = new IMAPFolder(paramURLName.getFile(), 65535, this);
      return localIMAPFolder;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  int getMinIdleTime()
  {
    return this.minIdleTime;
  }

  public Folder[] getPersonalNamespaces()
    throws MessagingException
  {
    Namespaces localNamespaces = getNamespaces();
    if ((localNamespaces == null) || (localNamespaces.personal == null))
      return super.getPersonalNamespaces();
    return namespaceToFolders(localNamespaces.personal, null);
  }

  // ERROR //
  IMAPProtocol getProtocol(IMAPFolder paramIMAPFolder)
    throws MessagingException
  {
    // Byte code:
    //   0: aconst_null
    //   1: astore_2
    //   2: aload_2
    //   3: ifnull +5 -> 8
    //   6: aload_2
    //   7: areturn
    //   8: aload_0
    //   9: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   12: astore_3
    //   13: aload_3
    //   14: monitorenter
    //   15: aload_0
    //   16: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   19: invokestatic 394	com/sun/mail/imap/IMAPStore$ConnectionPool:access$10	(Lcom/sun/mail/imap/IMAPStore$ConnectionPool;)Ljava/util/Vector;
    //   22: invokevirtual 588	java/util/Vector:isEmpty	()Z
    //   25: ifne +37 -> 62
    //   28: aload_0
    //   29: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   32: invokestatic 394	com/sun/mail/imap/IMAPStore$ConnectionPool:access$10	(Lcom/sun/mail/imap/IMAPStore$ConnectionPool;)Ljava/util/Vector;
    //   35: invokevirtual 291	java/util/Vector:size	()I
    //   38: iconst_1
    //   39: if_icmpne +221 -> 260
    //   42: aload_0
    //   43: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   46: invokestatic 643	com/sun/mail/imap/IMAPStore$ConnectionPool:access$11	(Lcom/sun/mail/imap/IMAPStore$ConnectionPool;)Z
    //   49: ifne +13 -> 62
    //   52: aload_0
    //   53: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   56: invokestatic 646	com/sun/mail/imap/IMAPStore$ConnectionPool:access$12	(Lcom/sun/mail/imap/IMAPStore$ConnectionPool;)Z
    //   59: ifeq +201 -> 260
    //   62: aload_0
    //   63: getfield 125	com/sun/mail/imap/IMAPStore:debug	Z
    //   66: ifeq +13 -> 79
    //   69: aload_0
    //   70: getfield 131	com/sun/mail/imap/IMAPStore:out	Ljava/io/PrintStream;
    //   73: ldc_w 648
    //   76: invokevirtual 175	java/io/PrintStream:println	(Ljava/lang/String;)V
    //   79: aload_0
    //   80: getfield 91	com/sun/mail/imap/IMAPStore:forcePasswordRefresh	Z
    //   83: istore 9
    //   85: iload 9
    //   87: ifeq +63 -> 150
    //   90: aload_0
    //   91: getfield 650	com/sun/mail/imap/IMAPStore:host	Ljava/lang/String;
    //   94: invokestatic 656	java/net/InetAddress:getByName	(Ljava/lang/String;)Ljava/net/InetAddress;
    //   97: astore 14
    //   99: aload 14
    //   101: astore 12
    //   103: aload_0
    //   104: getfield 580	com/sun/mail/imap/IMAPStore:session	Ljavax/mail/Session;
    //   107: aload 12
    //   109: aload_0
    //   110: getfield 73	com/sun/mail/imap/IMAPStore:port	I
    //   113: aload_0
    //   114: getfield 67	com/sun/mail/imap/IMAPStore:name	Ljava/lang/String;
    //   117: aconst_null
    //   118: aload_0
    //   119: getfield 658	com/sun/mail/imap/IMAPStore:user	Ljava/lang/String;
    //   122: invokevirtual 662	javax/mail/Session:requestPasswordAuthentication	(Ljava/net/InetAddress;ILjava/lang/String;Ljava/lang/String;Ljava/lang/String;)Ljavax/mail/PasswordAuthentication;
    //   125: astore 13
    //   127: aload 13
    //   129: ifnull +21 -> 150
    //   132: aload_0
    //   133: aload 13
    //   135: invokevirtual 667	javax/mail/PasswordAuthentication:getUserName	()Ljava/lang/String;
    //   138: putfield 658	com/sun/mail/imap/IMAPStore:user	Ljava/lang/String;
    //   141: aload_0
    //   142: aload 13
    //   144: invokevirtual 670	javax/mail/PasswordAuthentication:getPassword	()Ljava/lang/String;
    //   147: putfield 672	com/sun/mail/imap/IMAPStore:password	Ljava/lang/String;
    //   150: new 401	com/sun/mail/imap/protocol/IMAPProtocol
    //   153: dup
    //   154: aload_0
    //   155: getfield 67	com/sun/mail/imap/IMAPStore:name	Ljava/lang/String;
    //   158: aload_0
    //   159: getfield 650	com/sun/mail/imap/IMAPStore:host	Ljava/lang/String;
    //   162: aload_0
    //   163: getfield 73	com/sun/mail/imap/IMAPStore:port	I
    //   166: aload_0
    //   167: getfield 580	com/sun/mail/imap/IMAPStore:session	Ljavax/mail/Session;
    //   170: invokevirtual 122	javax/mail/Session:getDebug	()Z
    //   173: aload_0
    //   174: getfield 580	com/sun/mail/imap/IMAPStore:session	Ljavax/mail/Session;
    //   177: invokevirtual 129	javax/mail/Session:getDebugOut	()Ljava/io/PrintStream;
    //   180: aload_0
    //   181: getfield 580	com/sun/mail/imap/IMAPStore:session	Ljavax/mail/Session;
    //   184: invokevirtual 676	javax/mail/Session:getProperties	()Ljava/util/Properties;
    //   187: aload_0
    //   188: getfield 71	com/sun/mail/imap/IMAPStore:isSSL	Z
    //   191: invokespecial 679	com/sun/mail/imap/protocol/IMAPProtocol:<init>	(Ljava/lang/String;Ljava/lang/String;IZLjava/io/PrintStream;Ljava/util/Properties;Z)V
    //   194: astore 7
    //   196: aload_0
    //   197: aload 7
    //   199: aload_0
    //   200: getfield 658	com/sun/mail/imap/IMAPStore:user	Ljava/lang/String;
    //   203: aload_0
    //   204: getfield 672	com/sun/mail/imap/IMAPStore:password	Ljava/lang/String;
    //   207: invokespecial 681	com/sun/mail/imap/IMAPStore:login	(Lcom/sun/mail/imap/protocol/IMAPProtocol;Ljava/lang/String;Ljava/lang/String;)V
    //   210: aload 7
    //   212: ifnonnull +155 -> 367
    //   215: new 352	javax/mail/MessagingException
    //   218: dup
    //   219: ldc_w 683
    //   222: invokespecial 684	javax/mail/MessagingException:<init>	(Ljava/lang/String;)V
    //   225: athrow
    //   226: aload_3
    //   227: monitorexit
    //   228: aload 4
    //   230: athrow
    //   231: astore 11
    //   233: aconst_null
    //   234: astore 12
    //   236: goto -133 -> 103
    //   239: astore 6
    //   241: aload_2
    //   242: astore 7
    //   244: aload 7
    //   246: ifnull +8 -> 254
    //   249: aload 7
    //   251: invokevirtual 408	com/sun/mail/imap/protocol/IMAPProtocol:disconnect	()V
    //   254: aconst_null
    //   255: astore 7
    //   257: goto -47 -> 210
    //   260: aload_0
    //   261: getfield 125	com/sun/mail/imap/IMAPStore:debug	Z
    //   264: ifeq +36 -> 300
    //   267: aload_0
    //   268: getfield 131	com/sun/mail/imap/IMAPStore:out	Ljava/io/PrintStream;
    //   271: new 134	java/lang/StringBuilder
    //   274: dup
    //   275: ldc_w 686
    //   278: invokespecial 139	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   281: aload_0
    //   282: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   285: invokestatic 394	com/sun/mail/imap/IMAPStore$ConnectionPool:access$10	(Lcom/sun/mail/imap/IMAPStore$ConnectionPool;)Ljava/util/Vector;
    //   288: invokevirtual 291	java/util/Vector:size	()I
    //   291: invokevirtual 188	java/lang/StringBuilder:append	(I)Ljava/lang/StringBuilder;
    //   294: invokevirtual 148	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   297: invokevirtual 175	java/io/PrintStream:println	(Ljava/lang/String;)V
    //   300: aload_0
    //   301: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   304: invokestatic 394	com/sun/mail/imap/IMAPStore$ConnectionPool:access$10	(Lcom/sun/mail/imap/IMAPStore$ConnectionPool;)Ljava/util/Vector;
    //   307: invokevirtual 690	java/util/Vector:lastElement	()Ljava/lang/Object;
    //   310: checkcast 401	com/sun/mail/imap/protocol/IMAPProtocol
    //   313: astore 7
    //   315: aload_0
    //   316: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   319: invokestatic 394	com/sun/mail/imap/IMAPStore$ConnectionPool:access$10	(Lcom/sun/mail/imap/IMAPStore$ConnectionPool;)Ljava/util/Vector;
    //   322: aload 7
    //   324: invokevirtual 593	java/util/Vector:removeElement	(Ljava/lang/Object;)Z
    //   327: pop
    //   328: invokestatic 113	java/lang/System:currentTimeMillis	()J
    //   331: aload 7
    //   333: invokevirtual 547	com/sun/mail/imap/protocol/IMAPProtocol:getTimestamp	()J
    //   336: lsub
    //   337: lstore 16
    //   339: aload_0
    //   340: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   343: invokestatic 236	com/sun/mail/imap/IMAPStore$ConnectionPool:access$8	(Lcom/sun/mail/imap/IMAPStore$ConnectionPool;)J
    //   346: lstore 18
    //   348: lload 16
    //   350: lload 18
    //   352: lcmp
    //   353: ifle +8 -> 361
    //   356: aload 7
    //   358: invokevirtual 693	com/sun/mail/imap/protocol/IMAPProtocol:noop	()V
    //   361: aload 7
    //   363: aload_0
    //   364: invokevirtual 405	com/sun/mail/imap/protocol/IMAPProtocol:removeResponseHandler	(Lcom/sun/mail/iap/ResponseHandler;)V
    //   367: aload_0
    //   368: invokespecial 695	com/sun/mail/imap/IMAPStore:timeoutConnections	()V
    //   371: aload_1
    //   372: ifnull +38 -> 410
    //   375: aload_0
    //   376: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   379: invokestatic 361	com/sun/mail/imap/IMAPStore$ConnectionPool:access$13	(Lcom/sun/mail/imap/IMAPStore$ConnectionPool;)Ljava/util/Vector;
    //   382: ifnonnull +17 -> 399
    //   385: aload_0
    //   386: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   389: new 275	java/util/Vector
    //   392: dup
    //   393: invokespecial 696	java/util/Vector:<init>	()V
    //   396: invokestatic 365	com/sun/mail/imap/IMAPStore$ConnectionPool:access$14	(Lcom/sun/mail/imap/IMAPStore$ConnectionPool;Ljava/util/Vector;)V
    //   399: aload_0
    //   400: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   403: invokestatic 361	com/sun/mail/imap/IMAPStore$ConnectionPool:access$13	(Lcom/sun/mail/imap/IMAPStore$ConnectionPool;)Ljava/util/Vector;
    //   406: aload_1
    //   407: invokevirtual 328	java/util/Vector:addElement	(Ljava/lang/Object;)V
    //   410: aload_3
    //   411: monitorexit
    //   412: aload 7
    //   414: astore_2
    //   415: goto -413 -> 2
    //   418: astore 20
    //   420: aload 7
    //   422: aload_0
    //   423: invokevirtual 405	com/sun/mail/imap/protocol/IMAPProtocol:removeResponseHandler	(Lcom/sun/mail/iap/ResponseHandler;)V
    //   426: aload 7
    //   428: invokevirtual 408	com/sun/mail/imap/protocol/IMAPProtocol:disconnect	()V
    //   431: aload_3
    //   432: monitorexit
    //   433: aconst_null
    //   434: astore_2
    //   435: goto -433 -> 2
    //   438: astore 8
    //   440: goto -186 -> 254
    //   443: astore 4
    //   445: aload_2
    //   446: pop
    //   447: goto -221 -> 226
    //   450: astore 21
    //   452: goto -21 -> 431
    //   455: astore 10
    //   457: goto -213 -> 244
    //   460: astore 4
    //   462: goto -236 -> 226
    //
    // Exception table:
    //   from	to	target	type
    //   90	99	231	java/net/UnknownHostException
    //   79	85	239	java/lang/Exception
    //   90	99	239	java/lang/Exception
    //   103	127	239	java/lang/Exception
    //   132	150	239	java/lang/Exception
    //   150	196	239	java/lang/Exception
    //   356	361	418	com/sun/mail/iap/ProtocolException
    //   249	254	438	java/lang/Exception
    //   15	62	443	finally
    //   62	79	443	finally
    //   79	85	443	finally
    //   90	99	443	finally
    //   103	127	443	finally
    //   132	150	443	finally
    //   150	196	443	finally
    //   260	300	443	finally
    //   300	315	443	finally
    //   420	431	450	finally
    //   196	210	455	java/lang/Exception
    //   196	210	460	finally
    //   215	226	460	finally
    //   226	228	460	finally
    //   249	254	460	finally
    //   315	348	460	finally
    //   356	361	460	finally
    //   361	367	460	finally
    //   367	371	460	finally
    //   375	399	460	finally
    //   399	410	460	finally
    //   410	412	460	finally
    //   431	433	460	finally
  }

  // ERROR //
  public javax.mail.Quota[] getQuota(String paramString)
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: invokespecial 419	com/sun/mail/imap/IMAPStore:checkConnected	()V
    //   6: aconst_null
    //   7: checkcast 700	[Ljavax/mail/Quota;
    //   10: pop
    //   11: aconst_null
    //   12: astore 4
    //   14: aload_0
    //   15: invokevirtual 425	com/sun/mail/imap/IMAPStore:getStoreProtocol	()Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   18: astore 4
    //   20: aload 4
    //   22: aload_1
    //   23: invokevirtual 703	com/sun/mail/imap/protocol/IMAPProtocol:getQuotaRoot	(Ljava/lang/String;)[Ljavax/mail/Quota;
    //   26: astore 9
    //   28: aload_0
    //   29: aload 4
    //   31: invokevirtual 432	com/sun/mail/imap/IMAPStore:releaseStoreProtocol	(Lcom/sun/mail/imap/protocol/IMAPProtocol;)V
    //   34: aload 4
    //   36: ifnonnull +7 -> 43
    //   39: aload_0
    //   40: invokespecial 434	com/sun/mail/imap/IMAPStore:cleanup	()V
    //   43: aload_0
    //   44: monitorexit
    //   45: aload 9
    //   47: areturn
    //   48: astore 8
    //   50: new 352	javax/mail/MessagingException
    //   53: dup
    //   54: ldc_w 705
    //   57: aload 8
    //   59: invokespecial 446	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   62: athrow
    //   63: astore 6
    //   65: aload_0
    //   66: aload 4
    //   68: invokevirtual 432	com/sun/mail/imap/IMAPStore:releaseStoreProtocol	(Lcom/sun/mail/imap/protocol/IMAPProtocol;)V
    //   71: aload 4
    //   73: ifnonnull +7 -> 80
    //   76: aload_0
    //   77: invokespecial 434	com/sun/mail/imap/IMAPStore:cleanup	()V
    //   80: aload 6
    //   82: athrow
    //   83: astore_2
    //   84: aload_0
    //   85: monitorexit
    //   86: aload_2
    //   87: athrow
    //   88: astore 7
    //   90: new 436	javax/mail/StoreClosedException
    //   93: dup
    //   94: aload_0
    //   95: aload 7
    //   97: invokevirtual 439	com/sun/mail/iap/ConnectionException:getMessage	()Ljava/lang/String;
    //   100: invokespecial 442	javax/mail/StoreClosedException:<init>	(Ljavax/mail/Store;Ljava/lang/String;)V
    //   103: athrow
    //   104: astore 5
    //   106: new 352	javax/mail/MessagingException
    //   109: dup
    //   110: aload 5
    //   112: invokevirtual 443	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   115: aload 5
    //   117: invokespecial 446	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   120: athrow
    //
    // Exception table:
    //   from	to	target	type
    //   14	28	48	com/sun/mail/iap/BadCommandException
    //   14	28	63	finally
    //   50	63	63	finally
    //   90	104	63	finally
    //   106	121	63	finally
    //   2	11	83	finally
    //   28	34	83	finally
    //   39	43	83	finally
    //   65	71	83	finally
    //   76	80	83	finally
    //   80	83	83	finally
    //   14	28	88	com/sun/mail/iap/ConnectionException
    //   14	28	104	com/sun/mail/iap/ProtocolException
  }

  Session getSession()
  {
    return this.session;
  }

  public Folder[] getSharedNamespaces()
    throws MessagingException
  {
    Namespaces localNamespaces = getNamespaces();
    if ((localNamespaces == null) || (localNamespaces.shared == null))
      return super.getSharedNamespaces();
    return namespaceToFolders(localNamespaces.shared, null);
  }

  int getStatusCacheTimeout()
  {
    return this.statusCacheTimeout;
  }

  // ERROR //
  IMAPProtocol getStoreProtocol()
    throws ProtocolException
  {
    // Byte code:
    //   0: aconst_null
    //   1: astore_1
    //   2: aload_1
    //   3: ifnull +5 -> 8
    //   6: aload_1
    //   7: areturn
    //   8: aload_0
    //   9: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   12: astore_2
    //   13: aload_2
    //   14: monitorenter
    //   15: aload_0
    //   16: invokespecial 716	com/sun/mail/imap/IMAPStore:waitIfIdle	()V
    //   19: aload_0
    //   20: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   23: invokestatic 394	com/sun/mail/imap/IMAPStore$ConnectionPool:access$10	(Lcom/sun/mail/imap/IMAPStore$ConnectionPool;)Ljava/util/Vector;
    //   26: invokevirtual 588	java/util/Vector:isEmpty	()Z
    //   29: ifeq +178 -> 207
    //   32: aload_0
    //   33: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   36: invokestatic 206	com/sun/mail/imap/IMAPStore$ConnectionPool:access$3	(Lcom/sun/mail/imap/IMAPStore$ConnectionPool;)Z
    //   39: ifeq +13 -> 52
    //   42: aload_0
    //   43: getfield 131	com/sun/mail/imap/IMAPStore:out	Ljava/io/PrintStream;
    //   46: ldc_w 718
    //   49: invokevirtual 175	java/io/PrintStream:println	(Ljava/lang/String;)V
    //   52: new 401	com/sun/mail/imap/protocol/IMAPProtocol
    //   55: dup
    //   56: aload_0
    //   57: getfield 67	com/sun/mail/imap/IMAPStore:name	Ljava/lang/String;
    //   60: aload_0
    //   61: getfield 650	com/sun/mail/imap/IMAPStore:host	Ljava/lang/String;
    //   64: aload_0
    //   65: getfield 73	com/sun/mail/imap/IMAPStore:port	I
    //   68: aload_0
    //   69: getfield 580	com/sun/mail/imap/IMAPStore:session	Ljavax/mail/Session;
    //   72: invokevirtual 122	javax/mail/Session:getDebug	()Z
    //   75: aload_0
    //   76: getfield 580	com/sun/mail/imap/IMAPStore:session	Ljavax/mail/Session;
    //   79: invokevirtual 129	javax/mail/Session:getDebugOut	()Ljava/io/PrintStream;
    //   82: aload_0
    //   83: getfield 580	com/sun/mail/imap/IMAPStore:session	Ljavax/mail/Session;
    //   86: invokevirtual 676	javax/mail/Session:getProperties	()Ljava/util/Properties;
    //   89: aload_0
    //   90: getfield 71	com/sun/mail/imap/IMAPStore:isSSL	Z
    //   93: invokespecial 679	com/sun/mail/imap/protocol/IMAPProtocol:<init>	(Ljava/lang/String;Ljava/lang/String;IZLjava/io/PrintStream;Ljava/util/Properties;Z)V
    //   96: astore 5
    //   98: aload_0
    //   99: aload 5
    //   101: aload_0
    //   102: getfield 658	com/sun/mail/imap/IMAPStore:user	Ljava/lang/String;
    //   105: aload_0
    //   106: getfield 672	com/sun/mail/imap/IMAPStore:password	Ljava/lang/String;
    //   109: invokespecial 681	com/sun/mail/imap/IMAPStore:login	(Lcom/sun/mail/imap/protocol/IMAPProtocol;Ljava/lang/String;Ljava/lang/String;)V
    //   112: aload 5
    //   114: ifnonnull +39 -> 153
    //   117: new 417	com/sun/mail/iap/ConnectionException
    //   120: dup
    //   121: ldc_w 720
    //   124: invokespecial 721	com/sun/mail/iap/ConnectionException:<init>	(Ljava/lang/String;)V
    //   127: athrow
    //   128: aload_2
    //   129: monitorexit
    //   130: aload_3
    //   131: athrow
    //   132: astore 10
    //   134: aload_1
    //   135: astore 5
    //   137: aload 5
    //   139: ifnull +8 -> 147
    //   142: aload 5
    //   144: invokevirtual 411	com/sun/mail/imap/protocol/IMAPProtocol:logout	()V
    //   147: aconst_null
    //   148: astore 5
    //   150: goto -38 -> 112
    //   153: aload 5
    //   155: aload_0
    //   156: invokevirtual 724	com/sun/mail/imap/protocol/IMAPProtocol:addResponseHandler	(Lcom/sun/mail/iap/ResponseHandler;)V
    //   159: aload_0
    //   160: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   163: invokestatic 394	com/sun/mail/imap/IMAPStore$ConnectionPool:access$10	(Lcom/sun/mail/imap/IMAPStore$ConnectionPool;)Ljava/util/Vector;
    //   166: aload 5
    //   168: invokevirtual 328	java/util/Vector:addElement	(Ljava/lang/Object;)V
    //   171: aload_0
    //   172: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   175: invokestatic 646	com/sun/mail/imap/IMAPStore$ConnectionPool:access$12	(Lcom/sun/mail/imap/IMAPStore$ConnectionPool;)Z
    //   178: istore 6
    //   180: iload 6
    //   182: ifeq +86 -> 268
    //   185: aconst_null
    //   186: astore 5
    //   188: aload_0
    //   189: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   192: invokevirtual 575	java/lang/Object:wait	()V
    //   195: aload_0
    //   196: invokespecial 695	com/sun/mail/imap/IMAPStore:timeoutConnections	()V
    //   199: aload_2
    //   200: monitorexit
    //   201: aload 5
    //   203: astore_1
    //   204: goto -202 -> 2
    //   207: aload_0
    //   208: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   211: invokestatic 206	com/sun/mail/imap/IMAPStore$ConnectionPool:access$3	(Lcom/sun/mail/imap/IMAPStore$ConnectionPool;)Z
    //   214: ifeq +36 -> 250
    //   217: aload_0
    //   218: getfield 131	com/sun/mail/imap/IMAPStore:out	Ljava/io/PrintStream;
    //   221: new 134	java/lang/StringBuilder
    //   224: dup
    //   225: ldc_w 726
    //   228: invokespecial 139	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   231: aload_0
    //   232: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   235: invokestatic 394	com/sun/mail/imap/IMAPStore$ConnectionPool:access$10	(Lcom/sun/mail/imap/IMAPStore$ConnectionPool;)Ljava/util/Vector;
    //   238: invokevirtual 291	java/util/Vector:size	()I
    //   241: invokevirtual 188	java/lang/StringBuilder:append	(I)Ljava/lang/StringBuilder;
    //   244: invokevirtual 148	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   247: invokevirtual 175	java/io/PrintStream:println	(Ljava/lang/String;)V
    //   250: aload_0
    //   251: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   254: invokestatic 394	com/sun/mail/imap/IMAPStore$ConnectionPool:access$10	(Lcom/sun/mail/imap/IMAPStore$ConnectionPool;)Ljava/util/Vector;
    //   257: invokevirtual 729	java/util/Vector:firstElement	()Ljava/lang/Object;
    //   260: checkcast 401	com/sun/mail/imap/protocol/IMAPProtocol
    //   263: astore 5
    //   265: goto -94 -> 171
    //   268: aload_0
    //   269: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   272: iconst_1
    //   273: invokestatic 732	com/sun/mail/imap/IMAPStore$ConnectionPool:access$15	(Lcom/sun/mail/imap/IMAPStore$ConnectionPool;Z)V
    //   276: aload_0
    //   277: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   280: invokestatic 206	com/sun/mail/imap/IMAPStore$ConnectionPool:access$3	(Lcom/sun/mail/imap/IMAPStore$ConnectionPool;)Z
    //   283: ifeq -88 -> 195
    //   286: aload_0
    //   287: getfield 131	com/sun/mail/imap/IMAPStore:out	Ljava/io/PrintStream;
    //   290: ldc_w 734
    //   293: invokevirtual 175	java/io/PrintStream:println	(Ljava/lang/String;)V
    //   296: goto -101 -> 195
    //   299: astore 9
    //   301: goto -154 -> 147
    //   304: astore_3
    //   305: aload_1
    //   306: pop
    //   307: goto -179 -> 128
    //   310: astore 7
    //   312: aconst_null
    //   313: astore 5
    //   315: goto -120 -> 195
    //   318: astore 8
    //   320: goto -183 -> 137
    //   323: astore_3
    //   324: goto -196 -> 128
    //
    // Exception table:
    //   from	to	target	type
    //   52	98	132	java/lang/Exception
    //   142	147	299	java/lang/Exception
    //   15	52	304	finally
    //   52	98	304	finally
    //   207	250	304	finally
    //   250	265	304	finally
    //   188	195	310	java/lang/InterruptedException
    //   98	112	318	java/lang/Exception
    //   98	112	323	finally
    //   117	128	323	finally
    //   128	130	323	finally
    //   142	147	323	finally
    //   153	171	323	finally
    //   171	180	323	finally
    //   188	195	323	finally
    //   195	201	323	finally
    //   268	296	323	finally
  }

  public Folder[] getUserNamespaces(String paramString)
    throws MessagingException
  {
    Namespaces localNamespaces = getNamespaces();
    if ((localNamespaces == null) || (localNamespaces.otherUsers == null))
      return super.getUserNamespaces(paramString);
    return namespaceToFolders(localNamespaces.otherUsers, paramString);
  }

  public void handleResponse(Response paramResponse)
  {
    if ((paramResponse.isOK()) || (paramResponse.isNO()) || (paramResponse.isBAD()) || (paramResponse.isBYE()))
      handleResponseCode(paramResponse);
    if (paramResponse.isBYE())
    {
      if (this.debug)
        this.out.println("DEBUG: IMAPStore connection dead");
      if (this.connected)
        cleanup(paramResponse.isSynthetic());
    }
  }

  void handleResponseCode(Response paramResponse)
  {
    String str = paramResponse.getRest();
    boolean bool1 = str.startsWith("[");
    int i = 0;
    if (bool1)
    {
      int j = str.indexOf(']');
      i = 0;
      if (j > 0)
      {
        boolean bool2 = str.substring(0, j + 1).equalsIgnoreCase("[ALERT]");
        i = 0;
        if (bool2)
          i = 1;
      }
      str = str.substring(j + 1).trim();
    }
    if (i != 0)
      notifyStoreListeners(1, str);
    while ((!paramResponse.isUnTagged()) || (str.length() <= 0))
      return;
    notifyStoreListeners(2, str);
  }

  // ERROR //
  public boolean hasCapability(String paramString)
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aconst_null
    //   3: astore_2
    //   4: aload_0
    //   5: invokevirtual 425	com/sun/mail/imap/IMAPStore:getStoreProtocol	()Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   8: astore_2
    //   9: aload_2
    //   10: aload_1
    //   11: invokevirtual 453	com/sun/mail/imap/protocol/IMAPProtocol:hasCapability	(Ljava/lang/String;)Z
    //   14: istore 6
    //   16: aload_0
    //   17: aload_2
    //   18: invokevirtual 432	com/sun/mail/imap/IMAPStore:releaseStoreProtocol	(Lcom/sun/mail/imap/protocol/IMAPProtocol;)V
    //   21: aload_0
    //   22: monitorexit
    //   23: iload 6
    //   25: ireturn
    //   26: astore 5
    //   28: aload_2
    //   29: ifnonnull +7 -> 36
    //   32: aload_0
    //   33: invokespecial 434	com/sun/mail/imap/IMAPStore:cleanup	()V
    //   36: new 352	javax/mail/MessagingException
    //   39: dup
    //   40: aload 5
    //   42: invokevirtual 443	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   45: aload 5
    //   47: invokespecial 446	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   50: athrow
    //   51: astore_3
    //   52: aload_0
    //   53: aload_2
    //   54: invokevirtual 432	com/sun/mail/imap/IMAPStore:releaseStoreProtocol	(Lcom/sun/mail/imap/protocol/IMAPProtocol;)V
    //   57: aload_3
    //   58: athrow
    //   59: astore 4
    //   61: aload_0
    //   62: monitorexit
    //   63: aload 4
    //   65: athrow
    //
    // Exception table:
    //   from	to	target	type
    //   4	16	26	com/sun/mail/iap/ProtocolException
    //   4	16	51	finally
    //   32	36	51	finally
    //   36	51	51	finally
    //   16	21	59	finally
    //   52	59	59	finally
  }

  boolean hasSeparateStoreConnection()
  {
    return this.pool.separateStoreConnection;
  }

  // ERROR //
  public void idle()
    throws MessagingException
  {
    // Byte code:
    //   0: aconst_null
    //   1: astore_1
    //   2: getstatic 54	com/sun/mail/imap/IMAPStore:$assertionsDisabled	Z
    //   5: ifne +21 -> 26
    //   8: aload_0
    //   9: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   12: invokestatic 335	java/lang/Thread:holdsLock	(Ljava/lang/Object;)Z
    //   15: ifeq +11 -> 26
    //   18: new 337	java/lang/AssertionError
    //   21: dup
    //   22: invokespecial 338	java/lang/AssertionError:<init>	()V
    //   25: athrow
    //   26: aload_0
    //   27: monitorenter
    //   28: aload_0
    //   29: invokespecial 419	com/sun/mail/imap/IMAPStore:checkConnected	()V
    //   32: aload_0
    //   33: monitorexit
    //   34: aload_0
    //   35: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   38: astore 9
    //   40: aload 9
    //   42: monitorenter
    //   43: aload_0
    //   44: invokevirtual 425	com/sun/mail/imap/IMAPStore:getStoreProtocol	()Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   47: astore_1
    //   48: aload_0
    //   49: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   52: invokestatic 560	com/sun/mail/imap/IMAPStore$ConnectionPool:access$19	(Lcom/sun/mail/imap/IMAPStore$ConnectionPool;)I
    //   55: ifne +133 -> 188
    //   58: aload_1
    //   59: invokevirtual 797	com/sun/mail/imap/protocol/IMAPProtocol:idleStart	()V
    //   62: aload_0
    //   63: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   66: iconst_1
    //   67: invokestatic 570	com/sun/mail/imap/IMAPStore$ConnectionPool:access$20	(Lcom/sun/mail/imap/IMAPStore$ConnectionPool;I)V
    //   70: aload_0
    //   71: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   74: aload_1
    //   75: invokestatic 801	com/sun/mail/imap/IMAPStore$ConnectionPool:access$18	(Lcom/sun/mail/imap/IMAPStore$ConnectionPool;Lcom/sun/mail/imap/protocol/IMAPProtocol;)V
    //   78: aload 9
    //   80: monitorexit
    //   81: aload_1
    //   82: invokevirtual 805	com/sun/mail/imap/protocol/IMAPProtocol:readIdleResponse	()Lcom/sun/mail/iap/Response;
    //   85: astore 14
    //   87: aload_0
    //   88: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   91: astore 15
    //   93: aload 15
    //   95: monitorenter
    //   96: aload 14
    //   98: ifnull +12 -> 110
    //   101: aload_1
    //   102: aload 14
    //   104: invokevirtual 809	com/sun/mail/imap/protocol/IMAPProtocol:processIdleResponse	(Lcom/sun/mail/iap/Response;)Z
    //   107: ifne +194 -> 301
    //   110: aload_0
    //   111: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   114: iconst_0
    //   115: invokestatic 570	com/sun/mail/imap/IMAPStore$ConnectionPool:access$20	(Lcom/sun/mail/imap/IMAPStore$ConnectionPool;I)V
    //   118: aload_0
    //   119: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   122: invokevirtual 812	java/lang/Object:notifyAll	()V
    //   125: aload 15
    //   127: monitorexit
    //   128: aload_0
    //   129: invokevirtual 814	com/sun/mail/imap/IMAPStore:getMinIdleTime	()I
    //   132: istore 17
    //   134: iload 17
    //   136: ifle +13 -> 149
    //   139: iload 17
    //   141: i2l
    //   142: lstore 20
    //   144: lload 20
    //   146: invokestatic 818	java/lang/Thread:sleep	(J)V
    //   149: aload_0
    //   150: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   153: astore 18
    //   155: aload 18
    //   157: monitorenter
    //   158: aload_0
    //   159: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   162: aconst_null
    //   163: invokestatic 801	com/sun/mail/imap/IMAPStore$ConnectionPool:access$18	(Lcom/sun/mail/imap/IMAPStore$ConnectionPool;Lcom/sun/mail/imap/protocol/IMAPProtocol;)V
    //   166: aload 18
    //   168: monitorexit
    //   169: aload_0
    //   170: aload_1
    //   171: invokevirtual 432	com/sun/mail/imap/IMAPStore:releaseStoreProtocol	(Lcom/sun/mail/imap/protocol/IMAPProtocol;)V
    //   174: aload_1
    //   175: ifnonnull +7 -> 182
    //   178: aload_0
    //   179: invokespecial 434	com/sun/mail/imap/IMAPStore:cleanup	()V
    //   182: return
    //   183: astore_2
    //   184: aload_0
    //   185: monitorexit
    //   186: aload_2
    //   187: athrow
    //   188: aload_0
    //   189: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   192: invokevirtual 575	java/lang/Object:wait	()V
    //   195: aload 9
    //   197: monitorexit
    //   198: aload_0
    //   199: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   202: astore 12
    //   204: aload 12
    //   206: monitorenter
    //   207: aload_0
    //   208: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   211: aconst_null
    //   212: invokestatic 801	com/sun/mail/imap/IMAPStore$ConnectionPool:access$18	(Lcom/sun/mail/imap/IMAPStore$ConnectionPool;Lcom/sun/mail/imap/protocol/IMAPProtocol;)V
    //   215: aload 12
    //   217: monitorexit
    //   218: aload_0
    //   219: aload_1
    //   220: invokevirtual 432	com/sun/mail/imap/IMAPStore:releaseStoreProtocol	(Lcom/sun/mail/imap/protocol/IMAPProtocol;)V
    //   223: aload_1
    //   224: ifnonnull -42 -> 182
    //   227: aload_0
    //   228: invokespecial 434	com/sun/mail/imap/IMAPStore:cleanup	()V
    //   231: return
    //   232: astore 13
    //   234: aload 12
    //   236: monitorexit
    //   237: aload 13
    //   239: athrow
    //   240: astore 10
    //   242: aload 9
    //   244: monitorexit
    //   245: aload 10
    //   247: athrow
    //   248: astore 8
    //   250: new 352	javax/mail/MessagingException
    //   253: dup
    //   254: ldc_w 820
    //   257: aload 8
    //   259: invokespecial 446	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   262: athrow
    //   263: astore 4
    //   265: aload_0
    //   266: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   269: astore 5
    //   271: aload 5
    //   273: monitorenter
    //   274: aload_0
    //   275: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   278: aconst_null
    //   279: invokestatic 801	com/sun/mail/imap/IMAPStore$ConnectionPool:access$18	(Lcom/sun/mail/imap/IMAPStore$ConnectionPool;Lcom/sun/mail/imap/protocol/IMAPProtocol;)V
    //   282: aload 5
    //   284: monitorexit
    //   285: aload_0
    //   286: aload_1
    //   287: invokevirtual 432	com/sun/mail/imap/IMAPStore:releaseStoreProtocol	(Lcom/sun/mail/imap/protocol/IMAPProtocol;)V
    //   290: aload_1
    //   291: ifnonnull +7 -> 298
    //   294: aload_0
    //   295: invokespecial 434	com/sun/mail/imap/IMAPStore:cleanup	()V
    //   298: aload 4
    //   300: athrow
    //   301: aload 15
    //   303: monitorexit
    //   304: aload_0
    //   305: getfield 93	com/sun/mail/imap/IMAPStore:enableImapEvents	Z
    //   308: ifeq -227 -> 81
    //   311: aload 14
    //   313: invokevirtual 792	com/sun/mail/iap/Response:isUnTagged	()Z
    //   316: ifeq -235 -> 81
    //   319: aload_0
    //   320: sipush 1000
    //   323: aload 14
    //   325: invokevirtual 821	com/sun/mail/iap/Response:toString	()Ljava/lang/String;
    //   328: invokevirtual 789	com/sun/mail/imap/IMAPStore:notifyStoreListeners	(ILjava/lang/String;)V
    //   331: goto -250 -> 81
    //   334: astore 7
    //   336: new 436	javax/mail/StoreClosedException
    //   339: dup
    //   340: aload_0
    //   341: aload 7
    //   343: invokevirtual 439	com/sun/mail/iap/ConnectionException:getMessage	()Ljava/lang/String;
    //   346: invokespecial 442	javax/mail/StoreClosedException:<init>	(Ljavax/mail/Store;Ljava/lang/String;)V
    //   349: athrow
    //   350: astore 16
    //   352: aload 15
    //   354: monitorexit
    //   355: aload 16
    //   357: athrow
    //   358: astore_3
    //   359: new 352	javax/mail/MessagingException
    //   362: dup
    //   363: aload_3
    //   364: invokevirtual 443	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   367: aload_3
    //   368: invokespecial 446	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   371: athrow
    //   372: astore 6
    //   374: aload 5
    //   376: monitorexit
    //   377: aload 6
    //   379: athrow
    //   380: astore 19
    //   382: aload 18
    //   384: monitorexit
    //   385: aload 19
    //   387: athrow
    //   388: astore 22
    //   390: goto -241 -> 149
    //   393: astore 11
    //   395: goto -200 -> 195
    //
    // Exception table:
    //   from	to	target	type
    //   28	34	183	finally
    //   184	186	183	finally
    //   207	218	232	finally
    //   234	237	232	finally
    //   43	81	240	finally
    //   188	195	240	finally
    //   195	198	240	finally
    //   242	245	240	finally
    //   34	43	248	com/sun/mail/iap/BadCommandException
    //   81	96	248	com/sun/mail/iap/BadCommandException
    //   128	134	248	com/sun/mail/iap/BadCommandException
    //   144	149	248	com/sun/mail/iap/BadCommandException
    //   245	248	248	com/sun/mail/iap/BadCommandException
    //   304	331	248	com/sun/mail/iap/BadCommandException
    //   355	358	248	com/sun/mail/iap/BadCommandException
    //   34	43	263	finally
    //   81	96	263	finally
    //   128	134	263	finally
    //   144	149	263	finally
    //   245	248	263	finally
    //   250	263	263	finally
    //   304	331	263	finally
    //   336	350	263	finally
    //   355	358	263	finally
    //   359	372	263	finally
    //   34	43	334	com/sun/mail/iap/ConnectionException
    //   81	96	334	com/sun/mail/iap/ConnectionException
    //   128	134	334	com/sun/mail/iap/ConnectionException
    //   144	149	334	com/sun/mail/iap/ConnectionException
    //   245	248	334	com/sun/mail/iap/ConnectionException
    //   304	331	334	com/sun/mail/iap/ConnectionException
    //   355	358	334	com/sun/mail/iap/ConnectionException
    //   101	110	350	finally
    //   110	128	350	finally
    //   301	304	350	finally
    //   352	355	350	finally
    //   34	43	358	com/sun/mail/iap/ProtocolException
    //   81	96	358	com/sun/mail/iap/ProtocolException
    //   128	134	358	com/sun/mail/iap/ProtocolException
    //   144	149	358	com/sun/mail/iap/ProtocolException
    //   245	248	358	com/sun/mail/iap/ProtocolException
    //   304	331	358	com/sun/mail/iap/ProtocolException
    //   355	358	358	com/sun/mail/iap/ProtocolException
    //   274	285	372	finally
    //   374	377	372	finally
    //   158	169	380	finally
    //   382	385	380	finally
    //   144	149	388	java/lang/InterruptedException
    //   188	195	393	java/lang/InterruptedException
  }

  // ERROR //
  public boolean isConnected()
  {
    // Byte code:
    //   0: iconst_0
    //   1: istore_1
    //   2: aload_0
    //   3: monitorenter
    //   4: aload_0
    //   5: getfield 95	com/sun/mail/imap/IMAPStore:connected	Z
    //   8: ifne +12 -> 20
    //   11: aload_0
    //   12: iconst_0
    //   13: invokespecial 342	javax/mail/Store:setConnected	(Z)V
    //   16: aload_0
    //   17: monitorexit
    //   18: iload_1
    //   19: ireturn
    //   20: aconst_null
    //   21: astore_3
    //   22: aload_0
    //   23: invokevirtual 425	com/sun/mail/imap/IMAPStore:getStoreProtocol	()Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   26: astore_3
    //   27: aload_3
    //   28: invokevirtual 693	com/sun/mail/imap/protocol/IMAPProtocol:noop	()V
    //   31: aload_0
    //   32: aload_3
    //   33: invokevirtual 432	com/sun/mail/imap/IMAPStore:releaseStoreProtocol	(Lcom/sun/mail/imap/protocol/IMAPProtocol;)V
    //   36: aload_0
    //   37: invokespecial 585	javax/mail/Store:isConnected	()Z
    //   40: istore 6
    //   42: iload 6
    //   44: istore_1
    //   45: goto -29 -> 16
    //   48: astore 5
    //   50: aload_3
    //   51: ifnonnull +7 -> 58
    //   54: aload_0
    //   55: invokespecial 434	com/sun/mail/imap/IMAPStore:cleanup	()V
    //   58: aload_0
    //   59: aload_3
    //   60: invokevirtual 432	com/sun/mail/imap/IMAPStore:releaseStoreProtocol	(Lcom/sun/mail/imap/protocol/IMAPProtocol;)V
    //   63: goto -27 -> 36
    //   66: astore_2
    //   67: aload_0
    //   68: monitorexit
    //   69: aload_2
    //   70: athrow
    //   71: astore 4
    //   73: aload_0
    //   74: aload_3
    //   75: invokevirtual 432	com/sun/mail/imap/IMAPStore:releaseStoreProtocol	(Lcom/sun/mail/imap/protocol/IMAPProtocol;)V
    //   78: aload 4
    //   80: athrow
    //
    // Exception table:
    //   from	to	target	type
    //   22	31	48	com/sun/mail/iap/ProtocolException
    //   4	16	66	finally
    //   31	36	66	finally
    //   36	42	66	finally
    //   58	63	66	finally
    //   73	81	66	finally
    //   22	31	71	finally
    //   54	58	71	finally
  }

  boolean isConnectionPoolFull()
  {
    while (true)
    {
      synchronized (this.pool)
      {
        if (this.pool.debug)
          this.out.println("DEBUG: current size: " + this.pool.authenticatedConnections.size() + "   pool size: " + this.pool.poolSize);
        if (this.pool.authenticatedConnections.size() >= this.pool.poolSize)
        {
          bool = true;
          return bool;
        }
      }
      boolean bool = false;
    }
  }

  // ERROR //
  protected boolean protocolConnect(String paramString1, int paramInt, String paramString2, String paramString3)
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_1
    //   3: ifnull +12 -> 15
    //   6: aload 4
    //   8: ifnull +7 -> 15
    //   11: aload_3
    //   12: ifnonnull +89 -> 101
    //   15: aload_0
    //   16: getfield 125	com/sun/mail/imap/IMAPStore:debug	Z
    //   19: ifeq +66 -> 85
    //   22: aload_0
    //   23: getfield 131	com/sun/mail/imap/IMAPStore:out	Ljava/io/PrintStream;
    //   26: astore 7
    //   28: new 134	java/lang/StringBuilder
    //   31: dup
    //   32: ldc_w 834
    //   35: invokespecial 139	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   38: aload_1
    //   39: invokevirtual 143	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   42: ldc_w 836
    //   45: invokevirtual 143	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   48: aload_3
    //   49: invokevirtual 143	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   52: ldc_w 838
    //   55: invokevirtual 143	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   58: astore 8
    //   60: aload 4
    //   62: ifnull +31 -> 93
    //   65: ldc_w 840
    //   68: astore 9
    //   70: aload 7
    //   72: aload 8
    //   74: aload 9
    //   76: invokevirtual 143	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   79: invokevirtual 148	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   82: invokevirtual 175	java/io/PrintStream:println	(Ljava/lang/String;)V
    //   85: iconst_0
    //   86: istore 6
    //   88: aload_0
    //   89: monitorexit
    //   90: iload 6
    //   92: ireturn
    //   93: ldc_w 842
    //   96: astore 9
    //   98: goto -28 -> 70
    //   101: iload_2
    //   102: iconst_m1
    //   103: if_icmpeq +209 -> 312
    //   106: aload_0
    //   107: iload_2
    //   108: putfield 73	com/sun/mail/imap/IMAPStore:port	I
    //   111: aload_0
    //   112: getfield 73	com/sun/mail/imap/IMAPStore:port	I
    //   115: iconst_m1
    //   116: if_icmpne +11 -> 127
    //   119: aload_0
    //   120: aload_0
    //   121: getfield 69	com/sun/mail/imap/IMAPStore:defaultPort	I
    //   124: putfield 73	com/sun/mail/imap/IMAPStore:port	I
    //   127: aload_0
    //   128: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   131: astore 14
    //   133: aload 14
    //   135: monitorenter
    //   136: aload_0
    //   137: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   140: invokestatic 394	com/sun/mail/imap/IMAPStore$ConnectionPool:access$10	(Lcom/sun/mail/imap/IMAPStore$ConnectionPool;)Ljava/util/Vector;
    //   143: invokevirtual 588	java/util/Vector:isEmpty	()Z
    //   146: istore 16
    //   148: aload 14
    //   150: monitorexit
    //   151: iload 16
    //   153: ifeq +316 -> 469
    //   156: new 401	com/sun/mail/imap/protocol/IMAPProtocol
    //   159: dup
    //   160: aload_0
    //   161: getfield 67	com/sun/mail/imap/IMAPStore:name	Ljava/lang/String;
    //   164: aload_1
    //   165: aload_0
    //   166: getfield 73	com/sun/mail/imap/IMAPStore:port	I
    //   169: aload_0
    //   170: getfield 580	com/sun/mail/imap/IMAPStore:session	Ljavax/mail/Session;
    //   173: invokevirtual 122	javax/mail/Session:getDebug	()Z
    //   176: aload_0
    //   177: getfield 580	com/sun/mail/imap/IMAPStore:session	Ljavax/mail/Session;
    //   180: invokevirtual 129	javax/mail/Session:getDebugOut	()Ljava/io/PrintStream;
    //   183: aload_0
    //   184: getfield 580	com/sun/mail/imap/IMAPStore:session	Ljavax/mail/Session;
    //   187: invokevirtual 676	javax/mail/Session:getProperties	()Ljava/util/Properties;
    //   190: aload_0
    //   191: getfield 71	com/sun/mail/imap/IMAPStore:isSSL	Z
    //   194: invokespecial 679	com/sun/mail/imap/protocol/IMAPProtocol:<init>	(Ljava/lang/String;Ljava/lang/String;IZLjava/io/PrintStream;Ljava/util/Properties;Z)V
    //   197: astore 13
    //   199: aload_0
    //   200: getfield 125	com/sun/mail/imap/IMAPStore:debug	Z
    //   203: ifeq +43 -> 246
    //   206: aload_0
    //   207: getfield 131	com/sun/mail/imap/IMAPStore:out	Ljava/io/PrintStream;
    //   210: new 134	java/lang/StringBuilder
    //   213: dup
    //   214: ldc_w 844
    //   217: invokespecial 139	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   220: aload_1
    //   221: invokevirtual 143	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   224: ldc_w 836
    //   227: invokevirtual 143	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   230: aload_3
    //   231: invokevirtual 143	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   234: ldc_w 846
    //   237: invokevirtual 143	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   240: invokevirtual 148	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   243: invokevirtual 175	java/io/PrintStream:println	(Ljava/lang/String;)V
    //   246: aload_0
    //   247: aload 13
    //   249: aload_3
    //   250: aload 4
    //   252: invokespecial 681	com/sun/mail/imap/IMAPStore:login	(Lcom/sun/mail/imap/protocol/IMAPProtocol;Ljava/lang/String;Ljava/lang/String;)V
    //   255: aload 13
    //   257: aload_0
    //   258: invokevirtual 724	com/sun/mail/imap/protocol/IMAPProtocol:addResponseHandler	(Lcom/sun/mail/iap/ResponseHandler;)V
    //   261: aload_0
    //   262: aload_1
    //   263: putfield 650	com/sun/mail/imap/IMAPStore:host	Ljava/lang/String;
    //   266: aload_0
    //   267: aload_3
    //   268: putfield 658	com/sun/mail/imap/IMAPStore:user	Ljava/lang/String;
    //   271: aload_0
    //   272: aload 4
    //   274: putfield 672	com/sun/mail/imap/IMAPStore:password	Ljava/lang/String;
    //   277: aload_0
    //   278: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   281: astore 17
    //   283: aload 17
    //   285: monitorenter
    //   286: aload_0
    //   287: getfield 101	com/sun/mail/imap/IMAPStore:pool	Lcom/sun/mail/imap/IMAPStore$ConnectionPool;
    //   290: invokestatic 394	com/sun/mail/imap/IMAPStore$ConnectionPool:access$10	(Lcom/sun/mail/imap/IMAPStore$ConnectionPool;)Ljava/util/Vector;
    //   293: aload 13
    //   295: invokevirtual 328	java/util/Vector:addElement	(Ljava/lang/Object;)V
    //   298: aload 17
    //   300: monitorexit
    //   301: aload_0
    //   302: iconst_1
    //   303: putfield 95	com/sun/mail/imap/IMAPStore:connected	Z
    //   306: iconst_1
    //   307: istore 6
    //   309: goto -221 -> 88
    //   312: aload_0
    //   313: getfield 580	com/sun/mail/imap/IMAPStore:session	Ljavax/mail/Session;
    //   316: new 134	java/lang/StringBuilder
    //   319: dup
    //   320: ldc 136
    //   322: invokespecial 139	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   325: aload_0
    //   326: getfield 67	com/sun/mail/imap/IMAPStore:name	Ljava/lang/String;
    //   329: invokevirtual 143	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   332: ldc_w 848
    //   335: invokevirtual 143	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   338: invokevirtual 148	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   341: invokevirtual 152	javax/mail/Session:getProperty	(Ljava/lang/String;)Ljava/lang/String;
    //   344: astore 19
    //   346: aload 19
    //   348: ifnull -237 -> 111
    //   351: aload_0
    //   352: aload 19
    //   354: invokestatic 183	java/lang/Integer:parseInt	(Ljava/lang/String;)I
    //   357: putfield 73	com/sun/mail/imap/IMAPStore:port	I
    //   360: goto -249 -> 111
    //   363: astore 5
    //   365: aload_0
    //   366: monitorexit
    //   367: aload 5
    //   369: athrow
    //   370: astore 15
    //   372: aload 14
    //   374: monitorexit
    //   375: aload 15
    //   377: athrow
    //   378: astore 12
    //   380: aconst_null
    //   381: astore 13
    //   383: aload 13
    //   385: ifnull +8 -> 393
    //   388: aload 13
    //   390: invokevirtual 408	com/sun/mail/imap/protocol/IMAPProtocol:disconnect	()V
    //   393: new 850	javax/mail/AuthenticationFailedException
    //   396: dup
    //   397: aload 12
    //   399: invokevirtual 853	com/sun/mail/iap/CommandFailedException:getResponse	()Lcom/sun/mail/iap/Response;
    //   402: invokevirtual 768	com/sun/mail/iap/Response:getRest	()Ljava/lang/String;
    //   405: invokespecial 854	javax/mail/AuthenticationFailedException:<init>	(Ljava/lang/String;)V
    //   408: athrow
    //   409: astore 5
    //   411: goto -46 -> 365
    //   414: astore 18
    //   416: aload 17
    //   418: monitorexit
    //   419: aload 18
    //   421: athrow
    //   422: astore 12
    //   424: goto -41 -> 383
    //   427: astore 11
    //   429: new 352	javax/mail/MessagingException
    //   432: dup
    //   433: aload 11
    //   435: invokevirtual 443	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   438: aload 11
    //   440: invokespecial 446	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   443: athrow
    //   444: new 352	javax/mail/MessagingException
    //   447: dup
    //   448: aload 10
    //   450: invokevirtual 855	java/io/IOException:getMessage	()Ljava/lang/String;
    //   453: aload 10
    //   455: invokespecial 446	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   458: athrow
    //   459: astore 10
    //   461: goto -17 -> 444
    //   464: astore 11
    //   466: goto -37 -> 429
    //   469: goto -168 -> 301
    //   472: astore 10
    //   474: goto -30 -> 444
    //
    // Exception table:
    //   from	to	target	type
    //   15	60	363	finally
    //   70	85	363	finally
    //   106	111	363	finally
    //   111	127	363	finally
    //   127	136	363	finally
    //   156	199	363	finally
    //   312	346	363	finally
    //   351	360	363	finally
    //   375	378	363	finally
    //   136	151	370	finally
    //   372	375	370	finally
    //   127	136	378	com/sun/mail/iap/CommandFailedException
    //   156	199	378	com/sun/mail/iap/CommandFailedException
    //   375	378	378	com/sun/mail/iap/CommandFailedException
    //   199	246	409	finally
    //   246	286	409	finally
    //   301	306	409	finally
    //   388	393	409	finally
    //   393	409	409	finally
    //   419	422	409	finally
    //   429	444	409	finally
    //   444	459	409	finally
    //   286	301	414	finally
    //   416	419	414	finally
    //   199	246	422	com/sun/mail/iap/CommandFailedException
    //   246	286	422	com/sun/mail/iap/CommandFailedException
    //   419	422	422	com/sun/mail/iap/CommandFailedException
    //   127	136	427	com/sun/mail/iap/ProtocolException
    //   156	199	427	com/sun/mail/iap/ProtocolException
    //   375	378	427	com/sun/mail/iap/ProtocolException
    //   199	246	459	java/io/IOException
    //   246	286	459	java/io/IOException
    //   419	422	459	java/io/IOException
    //   199	246	464	com/sun/mail/iap/ProtocolException
    //   246	286	464	com/sun/mail/iap/ProtocolException
    //   419	422	464	com/sun/mail/iap/ProtocolException
    //   127	136	472	java/io/IOException
    //   156	199	472	java/io/IOException
    //   375	378	472	java/io/IOException
  }

  void releaseProtocol(IMAPFolder paramIMAPFolder, IMAPProtocol paramIMAPProtocol)
  {
    ConnectionPool localConnectionPool = this.pool;
    if (paramIMAPProtocol != null);
    try
    {
      if (!isConnectionPoolFull())
      {
        paramIMAPProtocol.addResponseHandler(this);
        this.pool.authenticatedConnections.addElement(paramIMAPProtocol);
        if (this.debug)
          this.out.println("DEBUG: added an Authenticated connection -- size: " + this.pool.authenticatedConnections.size());
      }
      while (true)
      {
        if (this.pool.folders != null)
          this.pool.folders.removeElement(paramIMAPFolder);
        timeoutConnections();
        return;
        if (this.debug)
          this.out.println("DEBUG: pool is full, not adding an Authenticated connection");
        try
        {
          paramIMAPProtocol.logout();
        }
        catch (ProtocolException localProtocolException)
        {
        }
      }
    }
    finally
    {
    }
  }

  void releaseStoreProtocol(IMAPProtocol paramIMAPProtocol)
  {
    if (paramIMAPProtocol == null)
      return;
    synchronized (this.pool)
    {
      this.pool.storeConnectionInUse = false;
      this.pool.notifyAll();
      if (this.pool.debug)
        this.out.println("DEBUG: releaseStoreProtocol()");
      timeoutConnections();
      return;
    }
  }

  public void setPassword(String paramString)
  {
    try
    {
      this.password = paramString;
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  // ERROR //
  public void setQuota(javax.mail.Quota paramQuota)
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: invokespecial 419	com/sun/mail/imap/IMAPStore:checkConnected	()V
    //   6: aconst_null
    //   7: astore_3
    //   8: aload_0
    //   9: invokevirtual 425	com/sun/mail/imap/IMAPStore:getStoreProtocol	()Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   12: astore_3
    //   13: aload_3
    //   14: aload_1
    //   15: invokevirtual 870	com/sun/mail/imap/protocol/IMAPProtocol:setQuota	(Ljavax/mail/Quota;)V
    //   18: aload_0
    //   19: aload_3
    //   20: invokevirtual 432	com/sun/mail/imap/IMAPStore:releaseStoreProtocol	(Lcom/sun/mail/imap/protocol/IMAPProtocol;)V
    //   23: aload_3
    //   24: ifnonnull +7 -> 31
    //   27: aload_0
    //   28: invokespecial 434	com/sun/mail/imap/IMAPStore:cleanup	()V
    //   31: aload_0
    //   32: monitorexit
    //   33: return
    //   34: astore 7
    //   36: new 352	javax/mail/MessagingException
    //   39: dup
    //   40: ldc_w 705
    //   43: aload 7
    //   45: invokespecial 446	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   48: athrow
    //   49: astore 5
    //   51: aload_0
    //   52: aload_3
    //   53: invokevirtual 432	com/sun/mail/imap/IMAPStore:releaseStoreProtocol	(Lcom/sun/mail/imap/protocol/IMAPProtocol;)V
    //   56: aload_3
    //   57: ifnonnull +7 -> 64
    //   60: aload_0
    //   61: invokespecial 434	com/sun/mail/imap/IMAPStore:cleanup	()V
    //   64: aload 5
    //   66: athrow
    //   67: astore_2
    //   68: aload_0
    //   69: monitorexit
    //   70: aload_2
    //   71: athrow
    //   72: astore 6
    //   74: new 436	javax/mail/StoreClosedException
    //   77: dup
    //   78: aload_0
    //   79: aload 6
    //   81: invokevirtual 439	com/sun/mail/iap/ConnectionException:getMessage	()Ljava/lang/String;
    //   84: invokespecial 442	javax/mail/StoreClosedException:<init>	(Ljavax/mail/Store;Ljava/lang/String;)V
    //   87: athrow
    //   88: astore 4
    //   90: new 352	javax/mail/MessagingException
    //   93: dup
    //   94: aload 4
    //   96: invokevirtual 443	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   99: aload 4
    //   101: invokespecial 446	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   104: athrow
    //
    // Exception table:
    //   from	to	target	type
    //   8	18	34	com/sun/mail/iap/BadCommandException
    //   8	18	49	finally
    //   36	49	49	finally
    //   74	88	49	finally
    //   90	105	49	finally
    //   2	6	67	finally
    //   18	23	67	finally
    //   27	31	67	finally
    //   51	56	67	finally
    //   60	64	67	finally
    //   64	67	67	finally
    //   8	18	72	com/sun/mail/iap/ConnectionException
    //   8	18	88	com/sun/mail/iap/ProtocolException
  }

  public void setUsername(String paramString)
  {
    try
    {
      this.user = paramString;
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  static class ConnectionPool
  {
    private static final int ABORTING = 2;
    private static final int IDLE = 1;
    private static final int RUNNING;
    private Vector authenticatedConnections = new Vector();
    private long clientTimeoutInterval = 45000L;
    private boolean debug = false;
    private Vector folders;
    private IMAPProtocol idleProtocol;
    private int idleState = 0;
    private long lastTimePruned;
    private int poolSize = 1;
    private long pruningInterval = 60000L;
    private boolean separateStoreConnection = false;
    private long serverTimeoutInterval = 1800000L;
    private boolean storeConnectionInUse = false;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.imap.IMAPStore
 * JD-Core Version:    0.6.2
 */