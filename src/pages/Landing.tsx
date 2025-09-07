import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export function Landing() {
  const { login } = useAuth(); // ← 追加

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-bg to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <span className="text-8xl">🐾</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-neutral-dark mb-6">
            <span className="text-primary">Animal</span>Share
          </h1>

          <p className="text-xl md:text-2xl text-neutral-medium mb-8 leading-relaxed">
            可愛い動物たちの写真を
            <br className="md:hidden" />
            みんなでシェアしよう！
          </p>

          <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg w-full md:w-auto"
              onClick={login} // ← ここを差し替え
            >
              ログインして始める
            </Button>
          </div>
        </div>
      </div>
      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-neutral-dark mb-12">
          カクミルの特徴
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="text-center border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏷️</span>
              </div>
              <CardTitle className="text-xl font-semibold text-neutral-dark">
                タグで簡単検索
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-medium">
                動物の種類、角度、パーツなど豊富なタグで
                お気に入りの写真を素早く見つけられます
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-16 h-16 bg-accent-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <CardTitle className="text-xl font-semibold text-neutral-dark">
                高度な検索機能
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-medium">
                複数のタグを組み合わせたAND検索で
                欲しい写真をピンポイントで見つけましょう
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-16 h-16 bg-accent-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🛡️</span>
              </div>
              <CardTitle className="text-xl font-semibold text-neutral-dark">
                ゾーニング機能
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-medium">
                見たくないタグを非表示にして あなた好みのフィードを作成できます
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-secondary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            今すぐ始めよう！
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            あなたの可愛いペットや出会った動物の写真を
            みんなとシェアしませんか？
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-neutral-bg px-8 py-4 text-lg"
            onClick={() =>
              (window.location.href = `${
                import.meta.env?.VITE_API_BASE_URL
              }/api/auth/google`)
            }
          >
            無料でアカウント作成
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-neutral-dark text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">🐾 AnimalShare</h3>
          <p className="text-neutral-light">動物愛好家のためのコミュニティ</p>
        </div>
      </footer>
    </div>
  );
}
