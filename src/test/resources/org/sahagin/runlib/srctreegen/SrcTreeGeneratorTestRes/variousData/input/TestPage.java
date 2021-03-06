package org.sahagin.runlib.srctreegen.SrcTreeGeneratorTestRes.variousData.input;

import org.sahagin.runlib.external.Page;
import org.sahagin.runlib.external.TestDoc;

@Page("Doc:TestPage")
public class TestPage {

    @TestDoc("Doc: TestPage")
    public TestPage() { }

    @TestDoc("data")
    public String getData() {
        return "EEE";
    }

    @TestDoc("Doc:argMethod:{arg1}:{arg2}:{0}:{1}:{this}")
    public void argMethod(String arg1, int arg2) {}

    @TestDoc("Doc:staticMethod")
    public static void staticMethod() {}

    private static class InnerClass {

        @TestDoc("Doc:innerClass")
        private void innerClassMethod() {}

    }

    @TestDoc("Doc:innerTestCall")
    public void inenrClassCall() {
        InnerClass innerClass = new InnerClass();
        innerClass.innerClassMethod();
    }

    @TestDoc("Doc:nest1:{arg}")
    public void nest1(String arg) {
        nest2(arg);
    }

    @TestDoc("Doc:nest2:{arg}")
    private void nest2(String arg) {
        nest3(arg);
    }

    @TestDoc("Doc:nest3:{arg}")
    private void nest3(String arg) {
        int i = 0;
        int j = 1;
        if (i != j) {
            return;
        }
        nest1(arg);
    }

    @TestDoc("Doc: recurseMethodCall")
    public void recurseMethodCall() {
        int i = 0;
        int j = 1;
        if (i != j) {
            return;
        }
        recurseMethodCall();
    }

}
