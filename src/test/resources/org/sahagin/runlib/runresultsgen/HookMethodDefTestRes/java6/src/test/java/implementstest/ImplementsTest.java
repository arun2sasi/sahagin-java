package implementstest;

import org.junit.Test;

import base.Java6TestBase;

public class ImplementsTest extends Java6TestBase
implements ImplementsTestBase {

    @Override
    public void testBaseMethod(String arg) {}

    @Test
    public void implementsTest() {
        testBaseMethod("DEF");
        ImplementsPage pageInstance = new ImplementsPage();
        pageInstance.baseMethod("QQQ");
        pageInstance.childMethod(-1);
        ImplementsPageBase baseInstance = new ImplementsPage();
        baseInstance.baseMethod("RRR");
    }

}
